import jsonwebtoken from "jsonwebtoken";

export const PRIVATE_KEY = 'decifra'
export const user = {
  name: 'Decifra Team',
  email: 'decifra@team.com'
}

export function tokenValited(
  request,
  response,
  next
) {
  const [, token] = request.headers.authorization?.split(' ') || [' ', ' '];
  
  if(!token) return response.status(401).send('Access denied. No token provided.');

  try {
    const payload = jsonwebtoken.verify(token, PRIVATE_KEY);
    console.log('Payload: ' + payload)
    const userIdFromToken = typeof payload !== 'string' && payload.user;
    console.log('UserId: ' + userIdFromToken)

    if(!user && !userIdFromToken) {
      return response.send(401).json({ message: 'Invalid token' });
    }

    request.headers['user'] = payload.user;

    return next();
  } catch(error) {
    console.log(error);
    return response.status(401).json({ message: 'Invalid token' });
  }
}