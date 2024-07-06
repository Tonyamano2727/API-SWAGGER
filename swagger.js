const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User API',
      version: '1.0.0',
      description: 'A simple Express API for managing users'
    },
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            name: {
              type: 'string'
            },
            email: {
              type: 'string'
            }
          }
        },
        Product: {
          type: 'object',
          properties: {
            title: {
              type: 'string'
            },
            category: {
              type: 'string'
            },
            color: {
              type: 'string'
            },
            price: {
              type: 'number'
            },
            description: {
              type: 'string'
            },
            brand: {
              type: 'string'
            },
            images: { 
              type: 'array',
              items: {
                type: 'string'
              }
            },
            thumb: {
              type: 'string'
            }
          }
        },
        Order: {
          type: 'object',
          properties: {
            products: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: {
                    type: 'string',
                    description: 'Product ID'
                  },
                  quantity: {
                    type: 'number'
                  },
                  color: {
                    type: 'string'
                  },
                  price: {
                    type: 'number'
                  },
                  title: {
                    type: 'string'
                  },
                  thumb: {
                    type: 'string'
                  }
                }
              }
            },
            status: {
              type: 'string',
              enum: ['Cancelled', 'Successed'],
              default: 'Cancelled'
            },
            total: {
              type: 'number'
            },
            orderBy: {
              type: 'string',
              description: 'User ID'
            },
            address: {
              type: 'string'
            }
          }
        }
      }
    }
  },
  apis: ['./controllers/*.js']
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
