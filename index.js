
import express from "express"
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';
import parser from'simple-excel-to-json';
import jsonwebtoken from 'jsonwebtoken'
import { user, PRIVATE_KEY, tokenValited } from "./Auth/auth.js";

const doc = parser.parseXls2Json('perguntas.xlsx')
const app = express();

const swaggerOptions = {
  swaggerDefinition: {
      info: {
          title: 'Dados.',
          version: '1.0.0'
      }
  },
  securityDefinitions: {
    JWT: {
      type: 'apiKey',
      description: 'JWT authorization of an API',
      name: 'Authorization',
      in: 'header',
    },
  },
  components: {
    securityDefinitions: {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            in: 'header'
        }
    }
},
security: [{
    bearerAuth: []
}],
  apis: ['index.js'],
};

const perguntas = () =>{
  const ask = []

  for (let i = 0; ask.length < doc[0].length; i++) {
    ask.push(`Pergunta ${i}: ${Object.values(doc[0][i])}`)
  }
  return ask;
}

const swaggerDocs = swaggerJsDoc(swaggerOptions);
console.log(swaggerDocs);
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocs));

  /**
   * @swagger
   * /login:
   *   post:
   *     parameters:
   *       - in: query
   *         name: Username
   *         type: 'string'
   *         description: Usuário
   *       - in: query
   *         name: Password
   *         type: 'string'
   *         description: Senha
   * 
   *     responses:
   *       200:
   *         description: login
   *         schema:
   *           type: object
   *           $ref: '#/definitions/Login'
   */
  app.post('/login', (req, res) => {
    console.log('Response: ' + JSON.stringify(req.query))


    try {
      const correctPassword = req.query.Username === 'decifra@team.com' && req.query.Password === '123456';
  
      if (!correctPassword) return res.status(401).send('Password or E-mail incorrect!');
  
      const token = jsonwebtoken.sign(
        { user: JSON.stringify(user) },
        PRIVATE_KEY,
        { expiresIn: '60m' }
      );
  
      return res.status(200).json(`${token}` );
    } catch (error) {
      console.log(error);
      return res.send(error);
    }


    res.send('ok')
  });

  function stringify(obj) {
    let cache = [];
    let str = JSON.stringify(obj, function(key, value) {
      if (typeof value === "object" && value !== null) {
        if (cache.indexOf(value) !== -1) {
          // Circular reference found, discard key
          return;
        }
        // Store value in our collection
        cache.push(value);
      }
      return value;
    });
    cache = null; // reset the cache
    return str;
  }

/**
 * @swagger
 * /asks:
 *  get:
 *      description: Dados
 *      parameters:
 *          - name: pageSize
 *            in: query
 *            desciption: number of cities
 *            type: integer
 *      responses:
 *          200:
 *              description: Success
 *      
 */

app.get('/asks', (req, res) => {
    res.send(
      perguntas()
    )})

app.listen(5000, () => console.log("listening on 5000/api-docs"));
