import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import csv from 'csv-parser';
import multer from 'multer';
import { Readable } from 'stream';

const prisma = new PrismaClient();

export class ImportController {
  // Import brands from CSV file
  static async importBrands(req: Request, res: Response): Promise<void> {
    try {
      // Check if CSV file is uploaded
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'CSV file is required'
        });
        return;
      }

      // Parse CSV from uploaded file
      const csvString = req.file.buffer.toString();
      const results = await ImportController.parseCSVFromString(csvString);
      
      const importedBrands = [];
      
      for (const row of results) {
        try {
          const brand = await prisma.brand.upsert({
            where: { name: row.name },
            update: {},
            create: { name: row.name },
          });
          importedBrands.push(brand);
        } catch (rowError) {
          console.error(`Error processing row:`, row, rowError);
          // Continue with other rows
        }
      }

      res.json({
        success: true,
        message: `Successfully imported ${importedBrands.length} brands`,
        data: importedBrands
      });
    } catch (error) {
      console.error('Import error:', error);
      res.status(500).json({
        success: false,
        message: 'Error importing brands',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Import categories from CSV file
  static async importCategories(req: Request, res: Response): Promise<void> {
    try {
      // Check if CSV file is uploaded
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'CSV file is required'
        });
        return;
      }

      // Parse CSV from uploaded file
      const csvString = req.file.buffer.toString();
      const results = await ImportController.parseCSVFromString(csvString);
      
      const importedCategories = [];
      
      for (const row of results) {
        try {
          const category = await prisma.category.upsert({
            where: { name: row.name },
            update: {},
            create: { name: row.name },
          });
          importedCategories.push(category);
        } catch (rowError) {
          console.error(`Error processing row:`, row, rowError);
          // Continue with other rows
        }
      }

      res.json({
        success: true,
        message: `Successfully imported ${importedCategories.length} categories`,
        data: importedCategories
      });
    } catch (error) {
      console.error('Import error:', error);
      res.status(500).json({
        success: false,
        message: 'Error importing categories',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Import items from CSV file
  static async importItems(req: Request, res: Response): Promise<void> {
    try {
      // Check if CSV file is uploaded
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'CSV file is required'
        });
        return;
      }

      // Parse CSV from uploaded file
      const csvString = req.file.buffer.toString();
      const results = await ImportController.parseCSVFromString(csvString);
      
      const importedItems = [];
      
      for (const row of results) {
        try {
          // Find or create brand
          let brandId = null;
          if (row.brand) {
            const brand = await prisma.brand.upsert({
              where: { name: row.brand },
              update: {},
              create: { name: row.brand },
            });
            brandId = brand.id;
          }

          // Find or create category
          let categoryId = null;
          if (row.category) {
            const category = await prisma.category.upsert({
              where: { name: row.category },
              update: {},
              create: { name: row.category },
            });
            categoryId = category.id;
          }

          const item = await prisma.item.upsert({
            where: { sku: row.sku },
            update: {
              name: row.name,
              costPrice: parseFloat(row.costPrice || '0'),
              salePrice: parseFloat(row.salePrice),
              stockQuantity: parseInt(row.stockQuantity || '0'),
              brandId,
              categoryId,
              isActive: row.isActive !== 'false',
            },
            create: {
              sku: row.sku,
              name: row.name,
              costPrice: parseFloat(row.costPrice || '0'),
              salePrice: parseFloat(row.salePrice),
              stockQuantity: parseInt(row.stockQuantity || '0'),
              brandId,
              categoryId,
              isActive: row.isActive !== 'false',
            },
          });
          importedItems.push(item);
        } catch (rowError) {
          console.error(`Error processing row:`, row, rowError);
          // Continue with other rows
        }
      }

      res.json({
        success: true,
        message: `Successfully imported ${importedItems.length} items`,
        data: importedItems
      });
    } catch (error) {
      console.error('Import error:', error);
      res.status(500).json({
        success: false,
        message: 'Error importing items',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Import customers from CSV file
  static async importCustomers(req: Request, res: Response): Promise<void> {
    try {
      // Check if CSV file is uploaded
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'CSV file is required'
        });
        return;
      }

      // Parse CSV from uploaded file
      const csvString = req.file.buffer.toString();
      const results = await ImportController.parseCSVFromString(csvString);
      
      const importedCustomers = [];
      
      for (const row of results) {
        try {
          const customer = await prisma.customer.upsert({
            where: { email: row.email },
            update: {
              name: row.name,
              phoneNumber: row.phoneNumber || null,
            },
            create: {
              name: row.name,
              email: row.email,
              phoneNumber: row.phoneNumber || null,
            },
          });
          importedCustomers.push(customer);
        } catch (rowError) {
          console.error(`Error processing row:`, row, rowError);
          // Continue with other rows
        }
      }

      res.json({
        success: true,
        message: `Successfully imported ${importedCustomers.length} customers`,
        data: importedCustomers
      });
    } catch (error) {
      console.error('Import error:', error);
      res.status(500).json({
        success: false,
        message: 'Error importing customers',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Import orders from CSV file
  static async importOrders(req: Request, res: Response): Promise<void> {
    try {
      // Check if CSV file is uploaded
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'CSV file is required'
        });
        return;
      }

      // Parse CSV from uploaded file
      const csvString = req.file.buffer.toString();
      const results = await ImportController.parseCSVFromString(csvString);
      
      const importedOrders = [];
      
      for (const row of results) {
        try {
          // Check if customer exists by ID
          const customer = await prisma.customer.findUnique({
            where: { id: parseInt(row.customerId) },
          });

          if (!customer) {
            console.warn(`Customer with ID ${row.customerId} not found, skipping order`);
            continue;
          }

          const order = await prisma.order.upsert({
            where: { orderCode: row.orderCode },
            update: {
              customerId: customer.id,
              shippingLocation: row.shippingLocation,
              platform: row.platform,
              orderDate: new Date(row.orderDate),
              status: row.status,
              refundReason: row.refundReason || null,
            },
            create: {
              orderCode: row.orderCode,
              customerId: customer.id,
              shippingLocation: row.shippingLocation,
              platform: row.platform,
              orderDate: new Date(row.orderDate),
              status: row.status,
              refundReason: row.refundReason || null,
            },
          });
          importedOrders.push(order);
        } catch (rowError) {
          console.error(`Error processing row:`, row, rowError);
          // Continue with other rows
        }
      }

      res.json({
        success: true,
        message: `Successfully imported ${importedOrders.length} orders`,
        data: importedOrders
      });
    } catch (error) {
      console.error('Import error:', error);
      res.status(500).json({
        success: false,
        message: 'Error importing orders',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Import order items from CSV file
  static async importOrderItems(req: Request, res: Response): Promise<void> {
    try {
      // Check if CSV file is uploaded
      if (!req.file) {
        res.status(400).json({
          success: false,
          message: 'CSV file is required'
        });
        return;
      }

      // Parse CSV from uploaded file
      const csvString = req.file.buffer.toString();
      const results = await ImportController.parseCSVFromString(csvString);
      
      const importedOrderItems = [];
      
      for (const row of results) {
        try {
          // Check if order exists
          const order = await prisma.order.findUnique({
            where: { orderCode: row.orderCode },
          });

          if (!order) {
            console.warn(`Order with code ${row.orderCode} not found, skipping item`);
            continue;
          }

          // Check if item exists
          const item = await prisma.item.findUnique({
            where: { sku: row.sku },
          });

          if (!item) {
            console.warn(`Item with SKU ${row.sku} not found, skipping item`);
            continue;
          }

          // Check stock availability
          if (item.stockQuantity < parseInt(row.quantity)) {
            console.warn(`Insufficient stock for item ${row.sku}, skipping item`);
            continue;
          }

          const orderItem = await prisma.orderItem.create({
            data: {
              orderId: order.id,
              itemId: item.id,
              quantity: parseInt(row.quantity),
              pricePerUnit: parseFloat(row.pricePerUnit),
              discountAmount: parseFloat(row.discountAmount || '0'),
            },
          });

          // Update item stock
          await prisma.item.update({
            where: { id: item.id },
            data: {
              stockQuantity: {
                decrement: parseInt(row.quantity),
              },
            },
          });

          importedOrderItems.push(orderItem);
        } catch (rowError) {
          console.error(`Error processing row:`, row, rowError);
          // Continue with other rows
        }
      }

      res.json({
        success: true,
        message: `Successfully imported ${importedOrderItems.length} order items`,
        data: importedOrderItems
      });
    } catch (error) {
      console.error('Import error:', error);
      res.status(500).json({
        success: false,
        message: 'Error importing order items',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Import all data in sequence from CSV files
  static async importAllData(req: Request, res: Response): Promise<void> {
    try {
      // Check if CSV files are uploaded
      if (!req.files) {
        res.status(400).json({
          success: false,
          message: 'CSV files are required: brands.csv, categories.csv, customers.csv, items.csv, orders.csv, order_items.csv'
        });
        return;
      }

      const results = {
        brands: 0,
        categories: 0,
        customers: 0,
        items: 0,
        orders: 0,
        orderItems: 0
      };

      // Process each CSV file
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      // Process brands
      if (files.brands && files.brands[0]) {
        const csvString = files.brands[0].buffer.toString();
        const data = await ImportController.parseCSVFromString(csvString);
        
        for (const row of data) {
          try {
            await prisma.brand.upsert({
              where: { name: row.name },
              update: {},
              create: { name: row.name },
            });
            results.brands++;
          } catch (error) {
            console.error('Error importing brand:', row, error);
          }
        }
      }
      
      // Process categories
      if (files.categories && files.categories[0]) {
        const csvString = files.categories[0].buffer.toString();
        const data = await ImportController.parseCSVFromString(csvString);
        
        for (const row of data) {
          try {
            await prisma.category.upsert({
              where: { name: row.name },
              update: {},
              create: { name: row.name },
            });
            results.categories++;
          } catch (error) {
            console.error('Error importing category:', row, error);
          }
        }
      }
      
      // Process customers
      if (files.customers && files.customers[0]) {
        const csvString = files.customers[0].buffer.toString();
        const data = await ImportController.parseCSVFromString(csvString);
        
        for (const row of data) {
          try {
            await prisma.customer.upsert({
              where: { email: row.email },
              update: {
                name: row.name,
                phoneNumber: row.phoneNumber || null,
              },
              create: {
                name: row.name,
                email: row.email,
                phoneNumber: row.phoneNumber || null,
              },
            });
            results.customers++;
          } catch (error) {
            console.error('Error importing customer:', row, error);
          }
        }
      }
      
      // Process items
      if (files.items && files.items[0]) {
        const csvString = files.items[0].buffer.toString();
        const data = await ImportController.parseCSVFromString(csvString);
        
        for (const row of data) {
          try {
            // Find or create brand
            let brandId = null;
            if (row.brand) {
              const brand = await prisma.brand.upsert({
                where: { name: row.brand },
                update: {},
                create: { name: row.brand },
              });
              brandId = brand.id;
            }

            // Find or create category
            let categoryId = null;
            if (row.category) {
              const category = await prisma.category.upsert({
                where: { name: row.category },
                update: {},
                create: { name: row.category },
              });
              categoryId = category.id;
            }

            await prisma.item.upsert({
              where: { sku: row.sku },
              update: {
                name: row.name,
                costPrice: parseFloat(row.costPrice || '0'),
                salePrice: parseFloat(row.salePrice),
                stockQuantity: parseInt(row.stockQuantity || '0'),
                brandId,
                categoryId,
                isActive: row.isActive !== 'false',
              },
              create: {
                sku: row.sku,
                name: row.name,
                costPrice: parseFloat(row.costPrice || '0'),
                salePrice: parseFloat(row.salePrice),
                stockQuantity: parseInt(row.stockQuantity || '0'),
                brandId,
                categoryId,
                isActive: row.isActive !== 'false',
              },
            });
            results.items++;
          } catch (error) {
            console.error('Error importing item:', row, error);
          }
        }
      }
      
      // Process orders
      if (files.orders && files.orders[0]) {
        const csvString = files.orders[0].buffer.toString();
        const data = await ImportController.parseCSVFromString(csvString);
        
        for (const row of data) {
          try {
            // Check if customer exists by ID
            const customer = await prisma.customer.findUnique({
              where: { id: parseInt(row.customerId) },
            });

            if (!customer) {
              console.warn(`Customer with ID ${row.customerId} not found, skipping order`);
              continue;
            }

            await prisma.order.upsert({
              where: { orderCode: row.orderCode },
              update: {
                customerId: customer.id,
                shippingLocation: row.shippingLocation,
                platform: row.platform,
                orderDate: new Date(row.orderDate),
                status: row.status,
                refundReason: row.refundReason || null,
              },
              create: {
                orderCode: row.orderCode,
                customerId: customer.id,
                shippingLocation: row.shippingLocation,
                platform: row.platform,
                orderDate: new Date(row.orderDate),
                status: row.status,
                refundReason: row.refundReason || null,
              },
            });
            results.orders++;
          } catch (error) {
            console.error('Error importing order:', row, error);
          }
        }
      }
      
      // Process order items
      if (files.order_items && files.order_items[0]) {
        const csvString = files.order_items[0].buffer.toString();
        const data = await ImportController.parseCSVFromString(csvString);
        
        for (const row of data) {
          try {
            // Check if order exists
            const order = await prisma.order.findUnique({
              where: { orderCode: row.orderCode },
            });

            if (!order) {
              console.warn(`Order with code ${row.orderCode} not found, skipping item`);
              continue;
            }

            // Check if item exists
            const item = await prisma.item.findUnique({
              where: { sku: row.sku },
            });

            if (!item) {
              console.warn(`Item with SKU ${row.sku} not found, skipping item`);
              continue;
            }

            await prisma.orderItem.create({
              data: {
                orderId: order.id,
                itemId: item.id,
                quantity: parseInt(row.quantity),
                pricePerUnit: parseFloat(row.pricePerUnit),
                discountAmount: parseFloat(row.discountAmount || '0'),
              },
            });
            results.orderItems++;
          } catch (error) {
            console.error('Error importing order item:', row, error);
          }
        }
      }

      res.json({
        success: true,
        message: 'Successfully imported all data',
        data: results
      });
    } catch (error) {
      console.error('Import all error:', error);
      res.status(500).json({
        success: false,
        message: 'Error importing all data',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Helper method to parse CSV from string data
  static parseCSVFromString(csvString: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const stream = Readable.from(csvString);
      
      stream
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }
} 