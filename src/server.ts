import { PrismaClient } from '@prisma/client';
import express from 'express';
import { convertHour } from './utils/convert-hour';
import { convertMinutes } from './utils/convert-minutes';

const coors = require('cors')
const app = express();

app.use(coors());
app.use(express.json());

const prisma = new PrismaClient({
    log: ['query']
});

app.get('/games', async (request, response)  => {
    const games = await prisma.game.findMany({
        include: {
            _count: {
                select: {
                    ads: true,
                }
            }
        }
    })
    
    return response.json(games)
});

app.post("/games/:id/ads", async (request, response) => {
    const gameId = request.params.id;
    const body = request.body;

    const ad = await prisma.ad.create({
        data: {
            gameId,
            name: body.name,
            yearsPlaying: body.yearsPlaying,
            discord: body.discord,
            weekDays: body.weekDays.join(','),
            hoursStart: convertHour(body.hoursStart),
            hoursEnd: convertHour(body.hoursEnd),
            useVoiceChannel: true,
        }
    })

    return response.status(201).json(ad);
  });


app.get('/games/:id/ads', async (request, response) => {
    const gameId = request.params.id;

    const ads = await prisma.ad.findMany({
        select: {
            id: true,
            name: true,
            weekDays: true,
            useVoiceChannel: true,
            yearsPlaying: true,
            hoursStart: true,
            hoursEnd: true,
        },
        where: {
            gameId,
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    
    return response.json(ads.map(ad => {
        return {
            ...ad,
            weekDays: ad.weekDays.split(','),
            hoursStart: convertMinutes(ad.hoursStart),
            hoursEnd: convertMinutes(ad.hoursEnd),
        }
    }));
})

app.get('/ads/:id/discord', async (request, response) => {
    const adId = request.params.id;

    const ad = await prisma.ad.findUniqueOrThrow({
        select: {
            discord: true,
        },
        where: {
            id: adId,
        }
    })
    
    return response.json({
        discord: ad.discord,
    })
})

console.log('Server Acessado!');
app.listen(3333);

function cors(): any {
    throw new Error('Function not implemented.');
}
