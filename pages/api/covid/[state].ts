import type { NextApiRequest, NextApiResponse } from "next";
import { APIdata } from ".";
import { prisma } from "../../../prisma/db";

const hours = new Date().getUTCHours();
const minutes = new Date().getUTCMinutes();
var maxage: number;
if (hours === 2 && minutes === 32) {
    maxage = 604800
} else {
    maxage = Math.abs((hours - 2) * 60 * 60) + Math.abs((minutes - 32) * 60)
}
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { state } = req.query
    const data = await prisma.data.findMany({ orderBy: { date: "desc" } });
    const stateData = (data[0].json as APIdata[]).find((x) => { if (x.state === state) return x })
    if (stateData === undefined) {
        res.status(200).json("Not found")
    } else {
        res.setHeader("Cache-Control", `public,s-maxage=${maxage},must-revalidate`)
        res.status(200).json(stateData)
    }
}