import { JSDOM } from "jsdom"
import { NextApiRequest, NextApiResponse } from "next";
import got from "got";
import { readFile, writeFile } from "fs/promises";


type APIdata = {
    state: string,
    confirmed: number,
    active: number,
    discharged: number,
    deaths: number
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    if (req.method === "POST" && req.headers.authorization === process.env.AUTH_TOKEN) {
        try {
            const response = await got("https://www.mygov.in/covid-19")
            const html = response.body
            const dom = new JSDOM(html, { contentType: "text/html", url: "https://www.mygov.in/covid-19" })
            const data: APIdata[] = [];
            for (var i = 1; i <= 36; i++) {
                const state = dom.window.document.querySelector(`#stateCount > div > div:nth-child(${i}) > span.st_name`)?.textContent!;
                const confirmed = dom.window.document.querySelector(`#stateCount > div > div:nth-child(${i}) > div > div.tick-confirmed > small`)?.textContent!.replaceAll(",", '');
                const active = dom.window.document.querySelector(`#stateCount > div > div:nth-child(${i}) > div > div.tick-active > small`)?.textContent!.replaceAll(",", '');
                const discharged = dom.window.document.querySelector(`#stateCount > div > div:nth-child(${i}) > div > div.tick-discharged > small`)?.textContent!.replaceAll(",", '');
                const deaths = dom.window.document.querySelector(`#stateCount > div > div:nth-child(${i}) > div > div.tick-death > small`)?.textContent?.replaceAll(",", '');

                data.push({
                    state, active: Number(active), confirmed: Number(confirmed), deaths: Number(deaths), discharged: Number(discharged)
                })
            }
            await writeFile("data.json", JSON.stringify(data), "utf-8")
            res.status(200).json("Data Updated");
        } catch (error) {
            console.error(error);
        }
    }
    else {
        if (req.method === "GET") {
            const resData = await readFile("data.json", { encoding: "utf-8" })
            res.status(200).json(resData)
        }

    }

}