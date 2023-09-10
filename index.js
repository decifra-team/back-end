
import express from "express"
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';
import parser from'simple-excel-to-json';
import jsonwebtoken from 'jsonwebtoken'
import { user, PRIVATE_KEY, tokenValited } from "./Auth/auth.js";
import json2xls from 'json2xls'
import fs from 'fs'
import cors from 'cors'


const doc = parser.parseXls2Json('perguntas.xlsx')
const app = express();

const swaggerOptions = {
  swaggerDefinition: {
      info: {
          title: 'Dados Decifra.',
          version: '1.0.1'
      }
  },
  securityDefinitions: {
    JWT: {
      type: 'apiKey',
      description: 'JWT authorization of an API',
      name: 'Authorization',
    },
  },
  components: {
    securitySchemes : {
        bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
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

var corsOptions = {
  origin: 'http://example.com',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

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
  app.post('/login', cors(), (req, res) => {
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
 *      description: Perguntas do projeto Decifra !
 *      responses:
 *          200:
 *              description: Success
 *      
 */

  app.get('/asks', cors(), (req, res) => {
    res.send(
      perguntas()
  )})


   /**
   * @swagger
   * /answear:
   *   post:
   *     parameters:
   *       - in: query
   *         name: idPergunta
   *         type: 'string'
   *         description: Id da pergunta
   *       - in: query
   *         name: resposta
   *         type: 'string'
   *         description: Resposta da pergunta
   * 
   *     responses:
   *       200:
   *         description: success
   */

    app.post('/answear', cors(), (req, res) => {

      console.log('ID PERGUNTA: ' + req.query.idPergunta)
      console.log('RESPOSTA: ' + req.query.resposta)

      const id = req.query.idPergunta;
      const resp = req.query.resposta;

      var json ={
        [id]: resp
      }

      var xls = json2xls(json)
      fs.writeFileSync('data.xlsx', xls, 'binary')
      
      res.send('ok')
    })

app.listen(5000, () => console.log("listening on 5000/api-docs"));
