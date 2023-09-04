const authService = require('../services/authService');
var jwt = require('jsonwebtoken');

const authController = {
    loginUser(){
        const a = jwt.sign({
            data: 'foobar'
          }, 'secret', { expiresIn: '1h' });

          return a;
    }
};
module.exports = authController;