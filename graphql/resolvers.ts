import { APIdata } from "../pages/api/covid";
import { prisma } from "../prisma/db"

const hours = new Date().getUTCHours();
const minutes = new Date().getUTCMinutes();
var maxage: number;
if (hours === 2 && minutes === 32) {
    maxage = 604800
} else {
    maxage = Math.abs((hours - 2) * 60 * 60) + Math.abs((minutes - 32) * 60)
}


export const resolvers = {
    Query: {
        //@ts-ignore
        getAll: async (parent, args, ctx, info) => {
            info.cacheControl.setCacheHint({ maxage, scope: "PUBLIC" })
            const data = await prisma.data.findMany({ orderBy: { date: "desc" } })
            return data[0].json
        },
        //@ts-ignore
        getByState: async (parent, args: { state: string }, ctx, info) => {

            const data = await prisma.data.findMany({ orderBy: { date: "desc" } });
            const stateData = (data[0].json as APIdata[]).find((x) => { if (x.state === args.state) return x })
            if (stateData !== undefined) {
                info.cacheControl.setCacheHint({ maxage, scope: "PUBLIC" })
            }
            return stateData;
        }
    }

}