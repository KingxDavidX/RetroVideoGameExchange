import { Controller, Get, Post, Patch, Delete, Route, Body, Request } from "tsoa";
import { CreateUserRequest } from "../models/CreateUserRequest";
import { UserResponse } from "../models/UserResponse";
import { UserEntity } from "../entities/UserEntity";
import { hashPassword, verifyPassword } from "../utils/Password";
import { toUserResponse } from "../mappers/userMapper";
import { AppDataSource } from "../data-source";
import { PatchUserRequest } from "../models/PatchUserRequest";
import { LoginRequest } from "../models/LoginRequest";
import { AuthResponse } from "../models/AuthResponse";
import { generateToken } from "../utils/jwt";
import { AuthenticatedRequest, authenticateToken } from "../middleware/authMiddleware";


const userRepo = AppDataSource.getRepository(UserEntity);


@Route("users")
export class UserController extends Controller {

    @Post("register")
    public async createUser(@Body() body: CreateUserRequest): Promise<AuthResponse> {
        const existingUser = await userRepo.findOne({ where: { email: body.email } });
        if (existingUser) {
            this.setStatus(409)
            throw new Error("User already exists");
        }

        const user = userRepo.create({
            name: body.name,
            email: body.email,
            streetAddress: body.streetAddress,
            passwordHash: await hashPassword(body.password),
        })

        await userRepo.save(user);

        const token = generateToken({
            userId: user.id,
            email: user.email,
        })

        this.setStatus(201)
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        };
    }

    @Post("login")
    public async login(@Body() body: LoginRequest ): Promise<AuthResponse> {
        const user = await userRepo.findOne({ where: { email: body.email } });

        if(!user) {
            this.setStatus(401);
            throw new Error("Invalid email or password");
        }

        const isValidPassword = await verifyPassword(body.password, user.passwordHash);
        if(!isValidPassword) {
            this.setStatus(401);
            throw new Error("Invalid email or password");
        }

        const token = generateToken({
            userId: user.id,
            email: user.email,
        });

        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        };
    }

    @Get("me")
    public async getCurrentUser(@Request() request: AuthenticatedRequest): Promise<UserResponse> {
        const authUser = authenticateToken(request);
        const user = await userRepo.findOneByOrFail({ id: authUser.userId });
        return toUserResponse(user);
    }

    // This is just for admin purposes, if I were ever to actually
    // put this into production one of the first things I would do
    // is delete this.
    @Get('{id}')
    public async getUser(id: number): Promise<UserResponse> {
        const user = await userRepo.findOneByOrFail({ id });
        return toUserResponse(user);
    }

    @Patch("me")
    public async patchCurrentUser(@Request() request: AuthenticatedRequest, @Body() body: PatchUserRequest): Promise<UserResponse> {
        const authUser = authenticateToken(request);
        const user = await userRepo.findOneByOrFail({ id: authUser.userId });

        if (body.name !== undefined) {
            user.name = body.name;
        }

        if (body.streetAddress !== undefined) {
            user.streetAddress = body.streetAddress;
        }

        await userRepo.save(user);
        return toUserResponse(user);
    }

    // This is my old code for patch,
    // this does not have any type of auth
    // @Patch('{id}')
    // public async patchUser(id: number, @Body() body: PatchUserRequest): Promise<UserResponse> {
    //     const user = await userRepo.findOneByOrFail({ id });
    //
    //     if (body.name !== undefined) {
    //         user.name = body.name;
    //     }
    //
    //     if (body.streetAddress !== undefined) {
    //         user.streetAddress = body.streetAddress;
    //     }
    //
    //     await userRepo.save(user);
    //     return toUserResponse(user);
    // }

    @Delete("me")
    public async deleteCurrentUser(@Request() request: AuthenticatedRequest): Promise<void> {
        const authUser = authenticateToken(request);
        await userRepo.delete(authUser.userId);
        this.setStatus(204);
    }

    // @Delete('{id}')
    // public async deleteUser(id: number): Promise<void> {
    //     await userRepo.delete(id);
    //
    //     this.setStatus(204)
    // }

}

