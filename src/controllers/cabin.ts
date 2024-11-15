import { Request, Response } from 'express';
import multer from 'multer';
// import fs from 'fs';
// import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { supabase, supabaseUrl } from '../utils/supabaseClient';

dotenv.config();
const prisma = new PrismaClient();

export const getCabinData = async (req: Request, res: Response) => {
  try {
    const cabins = await prisma.cabins.findMany({
      select: {
        id: true,
        name: true,
        maxCapacity: true,
        regularPrice: true,
        discount: true,
        image: true,
        description: true,
      },
    });

    // const calculateDiscount = cabins.map((cabin) => {
    //   const discount =
    //     cabin.regularPrice > 1500
    //       ? cabin.regularPrice * 0.4
    //       : cabin.regularPrice * 0.15;

    //   return {
    //     cabin,
    //     discount,
    //   };
    // });

    res.json({
      cabins,
    });
  } catch (e) {
    console.error('Failed to get Cabins', e);
  }
};

export const deleteCabin = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const cabinId = parseInt(id);

    if (isNaN(cabinId)) {
      return res.status(400).json({ error: 'Invalid cabin ID' });
    }

    const cabin = await prisma.cabins.findUnique({
      where: { id: cabinId },
    });

    if (!cabin) {
      return res.status(404).json({ error: 'Cabin not found' });
    }

    await prisma.cabins.delete({
      where: { id: cabinId },
    });

    // const dataDir = path.join(__dirname, '../../data', cabinId.toString());
    // console.log(dataDir);

    res.json({
      msg: 'Cabin deleted successfully!',
    });
  } catch (error) {
    console.error('Error deleting cabin:', error);
    res.status(500).json({
      error: 'Internal Server Error',
    });
  }
};

// If using local storage
// const dataDir = path.join(__dirname, '../../data/');
// if (!fs.existsSync(dataDir)) {
//   try {
//     fs.mkdirSync(dataDir, { recursive: true });
//   } catch (error) {
//     console.error('Error creating data directory:', error);
//     process.exit(1);
//   }
// }

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, dataDir);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + '-' + file.originalname);
//   },
// });

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const uploadMiddleware = upload.single('image');

export const createCabin = async (req: Request, res: Response) => {
  uploadMiddleware(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({
        error: err.message,
      });
    } else if (err) {
      return res.status(500).json({
        error: 'File Upload failed',
      });
    }

    try {
      const {
        name,
        maxCapacity,
        regularPrice,
        discount,
        description,
        image: imageString,
      } = req.body;

      let imagePath: string;
      if (req.file) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filePath = `cabins/images/${uniqueSuffix}-${req.file.originalname}`;

        // upload to bucket
        const { data, error: uploadError } = await supabase.storage
          .from('booking')
          .upload(filePath, req.file.buffer, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Supabase upload error', uploadError);
          return res
            .status(500)
            .json({ error: 'File upload to Supabase failed' });
        }
        imagePath = data?.path
          ? `${supabaseUrl}/storage/v1/object/public/booking/${filePath}`
          : '';
      } else if (typeof imageString === 'string') {
        imagePath = imageString;
      } else {
        return res
          .status(400)
          .json({ error: 'Image file or image string is required' });
      }

      const cabin = await prisma.cabins.create({
        data: {
          name,
          maxCapacity: parseInt(maxCapacity),
          regularPrice: parseInt(regularPrice),
          discount: parseInt(discount),
          description,
          image: imagePath,
        },
      });

      res.json({
        cabin,
        msg: 'Cabin created successfully!',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  });
};

export const updateCabin = async (req: Request, res: Response) => {
  uploadMiddleware(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: 'File Upload failed' });
    }

    try {
      const { id, name, maxCapacity, regularPrice, discount, description } =
        req.body;
      const cabinId = parseInt(id);
      let imagePath: string | undefined;

      if (req.file) {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const filePath = `cabins/${uniqueSuffix}-${req.file.originalname}`;

        const { data, error: uploadError } = await supabase.storage
          .from('booking')
          .upload(filePath, req.file.buffer, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          console.error('Supabase upload error', uploadError);
          return res
            .status(500)
            .json({ error: 'File upload to Supabase failed' });
        }

        imagePath = `${supabaseUrl}/storage/v1/object/public/booking/${filePath}`;
      }

      const cabin = await prisma.cabins.update({
        where: { id: cabinId },
        data: {
          name,
          maxCapacity: parseInt(maxCapacity),
          regularPrice: parseInt(regularPrice),
          discount: parseInt(discount),
          description,
          ...(imagePath ? { image: imagePath } : {}),
        },
      });

      res.json({
        cabin,
        msg: 'Cabin updated successfully!',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
};
