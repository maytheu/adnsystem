/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import express from 'express';
import * as path from 'path';
import { NOTIFICATION, channel, mqServer } from '@apps/queue';
import NotificationService from './notification.service';

const app = express();

app.use('/assets', express.static(path.join(__dirname, 'assets')));

mqServer(NOTIFICATION).then(() => {
  channel.consume(NOTIFICATION, async (data) => {
    const notificationEv: { data: object; notify: string } = JSON.parse(
      data.content
    );
    console.log(notificationEv);

    if (notificationEv.notify === 'new') {
      await NotificationService.newNotification(notificationEv.data as any);
    } else
      await NotificationService.sendNotification(
        notificationEv.data as any,
        data.notify
      );

    channel.ack(data);
  });
});

const port = process.env.PORT || 5001;
const server = app.listen(port, () => {
  console.log(`Notification service on port: ${port}`);
});
server.on('error', console.error);
