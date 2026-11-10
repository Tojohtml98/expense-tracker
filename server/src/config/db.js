import mongoose from 'mongoose';

// En serverless (Vercel) cada instancia reusa la misma conexión entre invocaciones:
// guardamos la promesa para no abrir una conexión nueva por request.
let connecting;

export function connectDB(uri) {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  connecting ??= mongoose
    .connect(uri, { serverSelectionTimeoutMS: 8000 })
    .then(() => console.log(`MongoDB conectado: ${mongoose.connection.host}`))
    .catch((err) => {
      connecting = undefined; // el próximo request reintenta
      throw err;
    });
  return connecting;
}
