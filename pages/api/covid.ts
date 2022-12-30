import { JSDOM } from "jsdom"
import { NextApiRequest, NextApiResponse } from "next";
import got from "got";
import { prisma } from "../../prisma/db";


export type APIdata = {
    state: string,
    confirmed: number,
    active: number,
    discharged: number,
    deaths: number
}

/**
 * @swagger
 * /api/covid:
 *   get:
 *     description: Covid19 India API
 *     responses:
 *       200:
 *         description: Success
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method === "POST" && req.headers.authorization === process.env.AUTH_TOKEN) {

        const response = await got("https://www.mygov.in/covid-19")
        const html = response.body
        const dom = new JSDOM(html, { contentType: "text/html", url: "https://www.mygov.in/covid-19" })
        const apidata: APIdata[] = [];
        for (var i = 1; i <= 36; i++) {
            const state = dom.window.document.querySelector(`#stateCount > div > div:nth-child(${i}) > span.st_name`)?.textContent!;
            const confirmed = dom.window.document.querySelector(`#stateCount > div > div:nth-child(${i}) > div > div.tick-confirmed > small`)?.textContent!.replaceAll(",", '');
            const active = dom.window.document.querySelector(`#stateCount > div > div:nth-child(${i}) > div > div.tick-active > small`)?.textContent!.replaceAll(",", '');
            const discharged = dom.window.document.querySelector(`#stateCount > div > div:nth-child(${i}) > div > div.tick-discharged > small`)?.textContent!.replaceAll(",", '');
            const deaths = dom.window.document.querySelector(`#stateCount > div > div:nth-child(${i}) > div > div.tick-death > small`)?.textContent?.replaceAll(",", '');

            apidata.push({
                state, active: Number(active), confirmed: Number(confirmed), deaths: Number(deaths), discharged: Number(discharged)
            })
        }

        await prisma.data.create({ data: { json: apidata } });
        res.status(200).json("Data Updated")

    } else {
        if (req.method === "GET") {
            const hours = new Date().getUTCHours();
            const minutes = new Date().getUTCMinutes();
            var maxage: number;
            if (hours === 2 && minutes === 32) {
                maxage = 604800
            } else {
                maxage = Math.abs((hours - 2) * 60 * 60) + Math.abs((minutes - 32) * 60)
            }
            console.log(maxage);
            try {
                const resData = await prisma.data.findMany({ orderBy: { date: "desc" } })
                res.setHeader("Cache-Control", `public,s-maxage=${maxage},must-revalidate`)
                res.status(200).json(resData[0].json)
            } catch (e) {
                res.status(500).json("Internal server error")
            }
        } else {
            res.status(405).json("Method not allowed")
        }
    }

}