import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

import prisma from '../db';
import { JWT_SECRET } from '../config';
import multer from 'multer';
import { supabase, supabaseUrl } from '../utils/supabaseClient';

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email, password: password },
    });
    if (!user) {
      return res.status(404).json({
        msg: 'Invalid Username / User doesnt Exists!',
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
      },
      JWT_SECRET
    );
    res.cookie('authorization', `Bearer ${token}`);
    return res.json({
      id: user.id,
      email: email,
      name: `${user.firstName} ${user.lastName}`,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function register(req: Request, res: Response) {
  try {
    const { firstName, lastName, email, password } = req.body;
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });
    if (existingUser) {
      return res.status(409).json({
        msg: 'User Already exists!',
      });
    }
    const newUser = await prisma.user.create({
      data: { email, password, firstName, lastName },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        Avatar: true,
      },
    });
    const token = jwt.sign(
      {
        id: newUser.id,
      },
      JWT_SECRET
    );

    res.cookie('authorization', `Bearer ${token}`);
    return res.status(201).json({
      msg: 'User registered Succeesfully',
      newUser,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function getCurrentUser(req: Request, res: Response) {
  res.json(req.user);
}

export async function logout(req: Request, res: Response) {
  res.status(200).clearCookie('authorization').json({
    msg: 'Logged Out Successfully',
  });
}

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const uploadMiddleware = upload.single('Avatar');

export const updateUser = async (req: Request, res: Response) => {
  uploadMiddleware(req, res, async (err) => {
    console.log(err);
    if (err instanceof multer.MulterError) {
      console.log(err);
      return res.status(400).json({
        error: err.message,
      });
    } else if (err) {
      return res.status(500).json({
        error: 'File Upload failed',
      });
    }

    try {
      const { id, firstName, lastName } = req.body;
      let avatarPath: string | undefined;

      if (req.file) {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const filePath = `users/avatars/${uniqueSuffix}-${req.file.originalname}`;

        const { data, error: uploadError } = await supabase.storage
          .from('booking')
          .upload(filePath, req.file.buffer, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Supabase upload error:', uploadError);
          return res
            .status(500)
            .json({ error: 'File upload to Supabase failed' });
        }

        avatarPath = `${supabaseUrl}/storage/v1/object/public/booking/${filePath}`;
      }

      const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: {
          firstName: firstName,
          lastName: lastName,
          Avatar: avatarPath,
        },
      });

      res.json({
        user,
        msg: 'User updated successfully!',
      });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
};
