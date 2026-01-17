import { Controller, Get, Post, Patch, Delete, Route, Body } from "tsoa";
import { CreateUserRequest } from "../models/CreateUserRequest";
import { UserResponse } from "../models/UserResponse";
import { UserEntity } from "../entities/UserEntity";
import { hashPassword } from "../utils/Password";
import { toUserResponse } from "../mappers/userMapper";
import { AppDataSource } from "../data-source";
import { PatchUserRequest } from "../models/PatchUserRequest";


const userRepo = AppDataSource.getRepository(UserEntity);


@Route("users")
export class UserController extends Controller {

    @Get('{id}')
    public async getUser(id: number): Promise<UserResponse> {
        const user = await userRepo.findOneByOrFail({ id });
        return toUserResponse(user);
    }


    // ChatGPT helped with this of this method
    // you can tell which methods was made or modified
    // because chat uses the same structure.
    @Post()
    public async createUser(
        @Body() body: CreateUserRequest
    ): Promise<UserResponse> {

        const user = userRepo.create({
            name: body.name,
            email: body.email,
            streetAddress: body.streetAddress,
            passwordHash: await hashPassword(body.password),
        });

        this.setStatus(201)
        await userRepo.save(user);
        return toUserResponse(user);
    }

    @Patch('{id}')
    public async patchUser(id: number, @Body() body: PatchUserRequest): Promise<UserResponse> {
        const user = await userRepo.findOneByOrFail({ id });

        if (body.name !== undefined) {
            user.name = body.name;
        }

        if (body.streetAddress !== undefined) {
            user.streetAddress = body.streetAddress;
        }

        await userRepo.save(user);
        return toUserResponse(user);
    }

    @Delete('{id}')
    public async deleteUser(id: number): Promise<void> {
        await userRepo.delete(id);

        this.setStatus(204)
    }

}

