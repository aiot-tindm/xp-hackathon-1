import swaggerJsdoc from 'swagger-jsdoc';

const PORT = process.env.PORT || 4001;

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Customer Analytics & Inventory Management API',
      version: '1.0.0',
      description: 'Comprehensive customer analytics and inventory management system with 6 specialized APIs',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Development server'
      }
    ],
    tags: [
      {
        name: 'Customer Analytics',
        description: 'Advanced customer analytics and insights'
      },
      {
        name: 'Items',
        description: 'Product inventory management'
      },
      {
        name: 'Orders',
        description: 'Sales order management'
      },
      {
        name: 'Brands',
        description: 'Brand management'
      },
      {
        name: 'Categories',
        description: 'Category management'
      },
      {
        name: 'Customers',
        description: 'Customer management'
      },
      {
        name: 'Analytics',
        description: 'General business analytics'
      },
      {
        name: 'Import',
        description: 'Data import functionality'
      }
    ],
    components: {
      schemas: {
        Customer: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' },
            email: { type: 'string' },
            phoneNumber: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        CustomerAnalytics: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                summary: {
                  type: 'object',
                  properties: {
                    totalCustomers: { type: 'integer' },
                    newCustomers: { type: 'integer' },
                    segments: {
                      type: 'object',
                      properties: {
                        whale: { type: 'integer' },
                        vip: { type: 'integer' },
                        regular: { type: 'integer' },
                        new: { type: 'integer' },
                        churn: { type: 'integer' }
                      }
                    }
                  }
                },
                customers: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'integer' },
                      name: { type: 'string' },
                      totalSpent: { type: 'number' },
                      totalOrders: { type: 'integer' },
                      avgOrderValue: { type: 'number' },
                      lastOrderDate: { type: 'string', format: 'date-time' },
                      segment: { type: 'string' },
                      clv: { type: 'number' },
                      clvRank: { type: 'integer' }
                    }
                  }
                }
              }
            }
          }
        },
        IndividualCustomerAnalysis: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                customer: { $ref: '#/components/schemas/Customer' },
                analysis: {
                  type: 'object',
                  properties: {
                    totalOrders: { type: 'integer' },
                    totalSpent: { type: 'number' },
                    totalItems: { type: 'integer' },
                    avgOrderValue: { type: 'number' },
                    lastOrderDate: { type: 'string', format: 'date-time', nullable: true },
                    daysSinceLastOrder: { type: 'integer' },
                    segment: { type: 'string' },
                    categoryBreakdown: { type: 'object' },
                    brandBreakdown: { type: 'object' },
                    monthlyTrends: { type: 'object' }
                  }
                }
              }
            }
          }
        },
        CustomerPrediction: {
          type: 'object',
          properties: {
            customerId: { type: 'integer' },
            customerName: { type: 'string' },
            currentCLV: { type: 'number' },
            predictedCLV: { type: 'number' },
            churnRisk: { type: 'number' },
            nextPurchaseDate: { type: 'string', format: 'date-time' },
            recommendedActions: {
              type: 'array',
              items: { type: 'string' }
            },
            purchaseFrequency: { type: 'number' },
            avgOrderValue: { type: 'number' },
            customerLifespan: { type: 'integer' },
            acquisitionCost: { type: 'number' },
            retentionRate: { type: 'number' },
            recommendations: {
              type: 'object',
              properties: {
                products: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      sku: { type: 'string' },
                      name: { type: 'string' },
                      reason: { type: 'string' },
                      confidence: { type: 'number' },
                      algorithm: { type: 'string' },
                      category: { type: 'string' },
                      brand: { type: 'string' },
                      price: { type: 'number' },
                      stockQuantity: { type: 'integer' }
                    }
                  }
                },
                promotions: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string' },
                      description: { type: 'string' },
                      validUntil: { type: 'string' },
                      targetAmount: { type: 'number' },
                      discountRate: { type: 'number' },
                      segment: { type: 'string' },
                      priority: { type: 'string' }
                    }
                  }
                },
                strategies: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      type: { type: 'string' },
                      description: { type: 'string' },
                      priority: { type: 'string' },
                      expectedImpact: { type: 'number' },
                      implementationCost: { type: 'number' }
                    }
                  }
                }
              }
            }
          }
        },
        CustomerPredictionsResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                predictions: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/CustomerPrediction' }
                },
                overallMetrics: {
                  type: 'object',
                  properties: {
                    totalPredictedRevenue: { type: 'number' },
                    avgChurnRisk: { type: 'number' },
                    avgRetentionRate: { type: 'number' },
                    totalCustomers: { type: 'integer' },
                    highValueCustomers: { type: 'integer' },
                    atRiskCustomers: { type: 'integer' }
                  }
                }
              }
            }
          }
        },
        RFMCustomer: {
          type: 'object',
          properties: {
            customerId: { type: 'integer' },
            customerName: { type: 'string' },
            customerEmail: { type: 'string' },
            recency: { type: 'integer' },
            frequency: { type: 'integer' },
            monetary: { type: 'number' },
            recencyScore: { type: 'integer' },
            frequencyScore: { type: 'integer' },
            monetaryScore: { type: 'integer' },
            rfmScore: { type: 'integer' },
            rfmSegment: { type: 'string' },
            businessSegment: { type: 'string' },
            insights: {
              type: 'object',
              properties: {
                recencyInsight: { type: 'string' },
                frequencyInsight: { type: 'string' },
                monetaryInsight: { type: 'string' },
                overallInsight: { type: 'string' }
              }
            },
            recommendations: {
              type: 'array',
              items: { type: 'string' }
            },
            lastOrderDate: { type: 'string', format: 'date-time' },
            firstOrderDate: { type: 'string', format: 'date-time' }
          }
        },
        RFMAnalysisResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                customers: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/RFMCustomer' }
                },
                summary: {
                  type: 'object',
                  properties: {
                    totalCustomersAnalyzed: { type: 'integer' },
                    averageRFMScore: { type: 'number' },
                    segmentDistribution: { type: 'object' }
                  }
                }
              }
            }
          }
        }
      }
    },
    paths: {
      '/api/analytics/customers': {
        get: {
          summary: 'Get customer analytics overview',
          description: 'Retrieve comprehensive customer analytics including segmentation, filters, and business types',
          tags: ['Customer Analytics'],
          parameters: [
            {
              in: 'query',
              name: 'page',
              schema: { type: 'integer', default: 1 },
              description: 'Page number'
            },
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer', default: 10 },
              description: 'Items per page'
            },
            {
              in: 'query',
              name: 'businessType',
              schema: { 
                type: 'string',
                enum: ['default', 'high_value', 'small_business', 'high_frequency', 'electronics', 'fashion_sports']
              },
              description: 'Business type for segmentation'
            }
          ],
          responses: {
            '200': {
              description: 'Customer analytics data',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CustomerAnalytics' }
                }
              }
            }
          }
        }
      },
      '/api/analytics/customers/predictions': {
        post: {
          summary: 'Get customer predictions and trends',
          description: 'Retrieve CLV predictions, churn risk, and product recommendations for customers',
          tags: ['Customer Analytics'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    customerIds: {
                      type: 'array',
                      items: { type: 'integer' },
                      description: 'Array of customer IDs to analyze'
                    },
                    includeRecommendations: {
                      type: 'boolean',
                      default: true,
                      description: 'Include product recommendations'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Customer predictions data',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/CustomerPredictionsResponse' }
                }
              }
            }
          }
        }
      },
      '/api/analytics/customers/rfm': {
        get: {
          summary: 'Get customer RFM analysis',
          description: 'Analyze customers using Recency, Frequency, Monetary scoring',
          tags: ['Customer Analytics'],
          parameters: [
            {
              in: 'query',
              name: 'customerId',
              schema: { type: 'integer' },
              description: 'Specific customer ID to analyze'
            },
            {
              in: 'query',
              name: 'businessType',
              schema: { 
                type: 'string',
                enum: ['default', 'high_value', 'small_business', 'high_frequency', 'electronics', 'fashion_sports']
              },
              description: 'Business type for RFM thresholds'
            }
          ],
          responses: {
            '200': {
              description: 'RFM analysis data',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/RFMAnalysisResponse' }
                }
              }
            }
          }
        }
      },
      '/api/analytics/customers/churn-prediction': {
        get: {
          summary: 'Get customer churn prediction',
          description: 'Predict which customers are likely to churn',
          tags: ['Customer Analytics'],
          parameters: [
            {
              in: 'query',
              name: 'days',
              schema: { type: 'integer', default: 90 },
              description: 'Days threshold for churn prediction'
            },
            {
              in: 'query',
              name: 'businessType',
              schema: { 
                type: 'string',
                enum: ['default', 'high_value', 'small_business', 'high_frequency', 'electronics', 'fashion_sports']
              },
              description: 'Business type for churn thresholds'
            }
          ],
          responses: {
            '200': {
              description: 'Churn prediction data'
            }
          }
        }
      },
      '/api/analytics/customers/new-inventory-matching': {
        get: {
          summary: 'Get potential customer suggestions for products',
          description: 'Find customers interested in specific products or categories (combines potential customers and new inventory matching)',
          tags: ['Customer Analytics'],
          parameters: [
            {
              in: 'query',
              name: 'productIds',
              schema: { type: 'string' },
              description: 'Comma-separated product IDs'
            },
            {
              in: 'query',
              name: 'categoryIds',
              schema: { type: 'string' },
              description: 'Comma-separated category IDs'
            },
            {
              in: 'query',
              name: 'limit',
              schema: { type: 'integer', default: 10 },
              description: 'Number of customers to return'
            },
            {
              in: 'query',
              name: 'businessType',
              schema: { 
                type: 'string',
                enum: ['default', 'high_value', 'small_business', 'high_frequency', 'electronics', 'fashion_sports']
              },
              description: 'Business type for scoring'
            }
          ],
          responses: {
            '200': {
              description: 'Potential customer suggestions and new inventory matching data'
            }
          }
        }
      },
      '/api/analytics/customers/{customerId}': {
        get: {
          summary: 'Get individual customer analysis',
          description: 'Detailed analysis of a specific customer',
          tags: ['Customer Analytics'],
          parameters: [
            {
              in: 'path',
              name: 'customerId',
              required: true,
              schema: { type: 'integer' },
              description: 'Customer ID'
            },
            {
              in: 'query',
              name: 'days',
              schema: { type: 'integer', default: 30 },
              description: 'Days for trend analysis'
            }
          ],
          responses: {
            '200': {
              description: 'Individual customer analysis data',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/IndividualCustomerAnalysis' }
                }
              }
            },
            '404': {
              description: 'Customer not found'
            }
          }
        }
      }
    }
  },
  apis: []
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec; 