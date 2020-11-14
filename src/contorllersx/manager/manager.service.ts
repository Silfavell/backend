import { Manager } from '../../models'

export const managerRequests = () => {
    return Manager.find({ verified: false })
}

export const allManagers = () => {
    return Manager.find()
}

export const verifyManager = (managerId: string) => (
    Manager.findByIdAndUpdate(managerId, { verified: true }, { new: true })
)

export const unverifyManager = (managerId: string) => (
    Manager.findByIdAndUpdate(managerId, { verified: false }, { new: true })
)

export const deleteManager = (managerId: string) => (
    Manager.findByIdAndDelete(managerId)
)