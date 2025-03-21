import { createClient } from 'redis';
import { ENV_VARS } from "./envVars.js";

const client = createClient({
    username: ENV_VARS.REDIS_USERNAME,
    password: ENV_VARS.REDIS_CLOUD_PASSWORD,
    socket: {
        host: ENV_VARS.REDIS_HOST,
        port: ENV_VARS.REDIS_PORT
    }
});

client.on('error', err => console.log('Redis Client Error', err));

await client.connect();

await client.set('foo', 'bar');
const result = await client.get('foo');
console.log(result)

export default client;

