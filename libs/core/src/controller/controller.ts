import { Response } from "express";

class Controller {
  /**
   * handle 200 response
   * @param res
   * @param message
   * @param data
   */
  sendResp(res: Response, message: string, data: object) {
    res.status(200).json({ message, data });
  }

  /**
   * handle 201 response
   * @param res
   * @param message
   * @param data
   */
  sendCreatedResp(res: Response, message: string, data: object) {
    res.status(201).json({ message, data });
  }

  /**
   * handle 204 response
   * @param res
   * @param message
   */
  sendDelResp(res: Response, message: string) {
    res.status(204).json({ message });
  }
}

export default Controller;
