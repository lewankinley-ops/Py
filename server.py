from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import socketio

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = FastAPI()

app.mount('/static', StaticFiles(directory='static'), name='static')

@sio.event
async def connect(sid, environ):
    print("Connected", sid)

@sio.event
async def join_room(sid, room):
    sio.enter_room(sid, room)
    await sio.emit('user_joined', sid, room=room, skip_sid=sid)

@sio.event
async def offer(sid, data):
    await sio.emit('offer', data, room=data['room'], skip_sid=sid)

@sio.event
async def answer(sid, data):
    await sio.emit('answer', data, room=data['room'], skip_sid=sid)

@sio.event
async def ice_candidate(sid, data):
    await sio.emit('ice_candidate', data, room=data['room'], skip_sid=sid)

socket_app = socketio.ASGIApp(sio, other_asgi_app=app)
