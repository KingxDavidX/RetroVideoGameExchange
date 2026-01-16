import { Router } from 'express';
import { User } from '../model/User';


const router = Router();

export class UserRoutes {
    static async signup(req: Request, res: Response) {
        const { name, password, email, streetAddress } = req.body;
        const NewUser nUser = new NewUser();
        nUser.name = name;
        nUser.passord = password;
        nUser.email = email;
        nUser.streetAddress = streetAddress;




    }
}