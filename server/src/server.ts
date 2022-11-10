import Fastify from 'fastify'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import shortUniqueId from 'short-unique-id'
import cors from '@fastify/cors'


//db connection
const prisma = new PrismaClient({
    log: ['query']
})

const codeGen = new shortUniqueId({length: 6})

async function server(){
    const fastify = Fastify({
        logger: true
    })

    fastify.register(cors, {
        origin: true
    })


    //root http://localhost:3333
    //get
    fastify.get('/pools/count', async (req, res) => {
       let count = await prisma.pool.count()

        return {count}
    })

    fastify.get('/guesses/count', async (req, res) =>{
        let count = await prisma.guess.count()

        return {count}
    })

    //post
    fastify.post('/pools/create', async (req, res) => {
        const createPoolBody = z.object({
            title: z.string()
        })
        const { title } = createPoolBody.parse(req.body)
        const code = codeGen()
        await prisma.pool.create({
            data: {
                title,
                code: String(code).toUpperCase()
            }
        })

        return res.status(201).send({code: code})
    })

    await fastify.listen({ port: 3333 })
}

server()