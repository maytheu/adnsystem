/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express, { NextFunction, Request, Response } from 'express';
import * as path from 'path';
import { NOTIFICATION, channel, mqServer } from '@apps/queue';
import NotificationService from './notification.service';
import { AppError } from '@apps/error';
import { Notify, User } from '@apps/core';
import { secret } from './secret';

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

mqServer(NOTIFICATION).then(() => {
  channel.consume(NOTIFICATION, async (data) => {
    const notificationEv: { data: object; notify: string } = JSON.parse(
      data.content
    );

    if (notificationEv.notify === 'new') {
      await NotificationService.newNotification(notificationEv.data as User);
    } else {
       NotificationService.sendNotification(
        notificationEv.data as Notify,
        notificationEv.notify
      );
    }

    channel.ack(data);
  });
});

app.use((req: Request, res: Response, next: NextFunction) => {
  next(
    new AppError(`Ooops.. ${req.originalUrl} not found on this server`, 404)
  );
});


const port = secret.PORT || 5001;
const server = app.listen(port, () => {
  console.log(`Notification service on port: ${port}`);
});
server.on('error', console.error);
