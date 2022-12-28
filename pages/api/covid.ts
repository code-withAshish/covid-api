import * as cheerio from 'cheerio';
import { writeFile } from 'fs/promises';
import type { NextApiRequest, NextApiResponse } from 'next'
import puppeteer from 'puppeteer';
import covData from "../../data.json";


type APIdata = {
  state: string,
  total_cases: number,
  active_cases: number,
  discharged_cases: number,
  total_deaths: number
}
/**
 * @swagger
 * /api/covid:
 *   get:
 *     summary: Retrieve a list of state-wise data.
 *     description: Retrieve a list of covid-19 data with fields 
 *                  state, total_cases, active_cases, discharged_cases, total_deaths.
 *     responses:
 *       200:
 *         description: Success
 *      
 */

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method === "POST" && req.headers.authorization === process.env.AUTH_TOKEN) {
    //&& req.headers.authorization === process.env.AUTH_TOKEN
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto("https://www.mygov.in/covid-19", { waitUntil: "networkidle0" })

    const table = await page.evaluate(() => {
      return document.querySelector("#_indiatable > div > div")?.innerHTML as string;
    })

    await browser.close();

    const $ = cheerio.load(table);

    var data: APIdata[] = [];
    //const head = $("#ind_mp_tbl > thead").text();
    for (var i = 1; i <= 36; i++) {

      const total_cases_data_difference = $(`#ind_mp_tbl > tbody > tr:nth-child(${i}) > td:nth-child(2) > p > span`).text().length;
      const active_cases_difference = $(`#ind_mp_tbl > tbody > tr:nth-child(${i}) > td:nth-child(3) > p > span`).text().length;
      const discharged_cases_difference = $(`#ind_mp_tbl > tbody > tr:nth-child(${i}) > td:nth-child(4) > p > span`).text().length;
      const total_deaths_difference = $(`#ind_mp_tbl > tbody > tr:nth-child(${i}) > td:nth-child(5) > p > span`).text().length;

      const state_name = $(`#ind_mp_tbl > tbody > tr:nth-child(${i}) > td:nth-child(1)`).text();

      var total_cases = $(`#ind_mp_tbl > tbody > tr:nth-child(${i}) > td:nth-child(2) > p`).text().replace(/[^0-9]/g, '');
      total_cases = total_cases.substring(0, total_cases.length - total_cases_data_difference)

      var active_cases = $(`#ind_mp_tbl > tbody > tr:nth-child(${i}) > td:nth-child(3) > p`).text().replace(/[^0-9]/g, '');
      active_cases = active_cases.substring(0, active_cases.length - active_cases_difference)

      var discharged_cases = $(`#ind_mp_tbl > tbody > tr:nth-child(${i}) > td:nth-child(4) > p`).text().replace(/[^0-9]/g, '');
      discharged_cases = discharged_cases.substring(0, discharged_cases.length - discharged_cases_difference)

      var total_deaths = $(`#ind_mp_tbl > tbody > tr:nth-child(${i}) > td:nth-child(5) > p`).text().replace(/[^0-9]/g, '');
      total_deaths = total_deaths.substring(0, total_deaths.length - total_deaths_difference)


      data.push({ state: state_name, total_cases: Number(total_cases), active_cases: Number(active_cases), discharged_cases: Number(discharged_cases), total_deaths: Number(total_deaths) })
    }
    await writeFile("data.json", JSON.stringify(data), "utf-8")

    res.json("Data Updated")
  } else {

    res.status(200).json(covData)
  }
}
