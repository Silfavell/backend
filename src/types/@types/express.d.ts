import { UserDocument, ManagerDocument, AdminDocument } from '../../models'

declare global {
    namespace Express {
        interface Request {
            user?: UserDocument
            manager?: ManagerDocument
            admin?: AdminDocument
        }
    }
}