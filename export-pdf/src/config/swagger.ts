import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Export PDF Service API',
      version: '1.0.0',
      description: 'API để xuất báo cáo PDF với biểu đồ trực tiếp với tham số cụ thể',
      contact: {
        name: 'Export PDF Service Team',
        email: 'support@exportpdfservice.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      },
      {
        url: 'https://api.exportpdfservice.com',
        description: 'Production server'
      }
    ],
    components: {
      schemas: {
        DirectExportRequest: {
          type: 'object',
          required: ['type'],
          properties: {
            type: {
              type: 'string',
              enum: ['best_seller', 'refund', 'refund_reason', 'revenue', 'slow_moving', 'all'],
              description: 'Loại export để tạo báo cáo PDF với biểu đồ tương ứng'
            },
            platform: {
              type: 'string',
              description: 'Nền tảng (shopee, ebay, website, etc.)'
            },
            month: {
              type: 'string',
              description: 'Tháng (01-12)'
            },
            year: {
              type: 'integer',
              description: 'Năm'
            },
            quarter: {
              type: 'string',
              enum: ['Q1', 'Q2', 'Q3', 'Q4'],
              description: 'Quý'
            },
            include_refund: {
              type: 'boolean',
              description: 'Bao gồm dữ liệu hoàn hàng trong biểu đồ'
            },
            limit: {
              type: 'integer',
              default: 10,
              description: 'Số lượng bản ghi tối đa hiển thị trong biểu đồ'
            },
            format: {
              type: 'string',
              enum: ['pdf', 'excel', 'csv'],
              default: 'pdf',
              description: 'Định dạng file xuất (hiện tại chỉ hỗ trợ PDF với biểu đồ)'
            },
            language: {
              type: 'string',
              enum: ['vi', 'en'],
              default: 'vi',
              description: 'Ngôn ngữ của báo cáo PDF'
            }
          }
        },
        ExportResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Trạng thái xử lý'
            },
            message: {
              type: 'string',
              description: 'Thông báo kết quả'
            },
            data: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                  description: 'Tiêu đề báo cáo PDF'
                },
                subtitle: {
                  type: 'string',
                  description: 'Phụ đề báo cáo PDF'
                },
                period: {
                  type: 'string',
                  description: 'Thời gian báo cáo'
                },
                data: {
                  type: 'array',
                  description: 'Dữ liệu báo cáo để tạo biểu đồ'
                },
                summary: {
                  type: 'object',
                  description: 'Tóm tắt báo cáo'
                },
                charts: {
                  type: 'array',
                  description: 'Danh sách biểu đồ được tạo trong PDF',
                  items: {
                    type: 'object',
                    properties: {
                      type: {
                        type: 'string',
                        enum: ['bar', 'line', 'pie', 'doughnut']
                      },
                      title: {
                        type: 'string'
                      },
                      data: {
                        type: 'object'
                      }
                    }
                  }
                },
                metadata: {
                  type: 'object',
                  properties: {
                    generated_at: {
                      type: 'string',
                      format: 'date-time'
                    },
                    total_records: {
                      type: 'integer'
                    },
                    export_type: {
                      type: 'string',
                      enum: ['best_seller', 'refund', 'refund_reason', 'revenue', 'slow_moving', 'all']
                    }
                  }
                }
              }
            },
            file_url: {
              type: 'string',
              description: 'URL file PDF đã xuất với biểu đồ'
            },
            processing_time: {
              type: 'integer',
              description: 'Thời gian xử lý (ms)'
            },
            status: {
              type: 'string',
              enum: ['success', 'error']
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Thông báo lỗi'
            },
            processing_time: {
              type: 'integer',
              description: 'Thời gian xử lý (ms)'
            },
            status: {
              type: 'string',
              example: 'error'
            }
          }
        },
        HealthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean'
            },
            status: {
              type: 'string',
              enum: ['healthy', 'unhealthy']
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        ExamplesResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean'
            },
            examples: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    description: 'Loại báo cáo'
                  },
                  description: {
                    type: 'string',
                    description: 'Mô tả báo cáo và loại biểu đồ sẽ được tạo'
                  },
                  request: {
                    type: 'object',
                    description: 'Request body mẫu'
                  },
                  charts: {
                    type: 'array',
                    description: 'Các loại biểu đồ sẽ được tạo trong PDF',
                    items: {
                      type: 'string',
                      enum: ['bar', 'line', 'pie', 'doughnut']
                    }
                  }
                }
              }
            },
            usage: {
              type: 'object',
              properties: {
                endpoint: {
                  type: 'string'
                },
                body: {
                  type: 'object'
                }
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Export',
        description: 'API xuất báo cáo PDF với biểu đồ trực tiếp với tham số cụ thể'
      },
      {
        name: 'Health',
        description: 'Các API kiểm tra trạng thái dịch vụ'
      },
    ]
  },
  apis: ['./src/routes/*.ts', './src/types/*.ts'] // Path to the API docs
};

export const specs = swaggerJsdoc(options); 