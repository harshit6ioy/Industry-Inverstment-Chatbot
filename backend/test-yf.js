import { YahooFinance } from "yahoo-finance2";

const yahooFinance = new YahooFinance();

async function test() {
    try {
        const query = "Amazon";
        const results = await yahooFinance.search(query);
        const topResult = results.quotes[0];
        if (topResult) {
            console.log("Top result:", topResult.symbol);
            const quote = await yahooFinance.quote(topResult.symbol);
            console.log("Quote:", quote.shortName, quote.regularMarketPrice);
        }
    } catch (e) {
        console.error(e);
    }
}
test();
