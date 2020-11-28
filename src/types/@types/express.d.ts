import { UserDocument, AdminDocument } from '../../models'

declare global {
    namespace Express {
        interface Request {
            user?: UserDocument;
            admin?: AdminDocument;
        }
    }
}