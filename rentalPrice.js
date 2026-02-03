const MINIMUM_RENTAL_AGE = 18;
const COMPACT_MAX_AGE = 21;
const RACER_AGE_SURCHARGE = 25;
const RACER_SURCHARGE_FACTOR = 1.5;
const HIGH_SEASON_FACTOR = 1.15;
const LONG_RENTAL_DAYS_THRESHOLD = 10;
const LONG_RENTAL_DISCOUNT = 0.9;
const LICENSE_INELIGIBLE_YEARS = 1;
const LICENSE_SHORT_YEARS = 2;
const LICENSE_ADDITIONAL_FEE_YEARS = 3;
const LICENSE_SHORT_SURCHARGE_FACTOR = 1.3;
const LICENSE_HIGH_SEASON_DAILY_FEE = 15;

const APRIL = 3;
const OCTOBER = 9;

function toDate(d) {
    if (d instanceof Date) return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const parsed = new Date(d);
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
}

function getDays(startDate, endDate) {
    const msPerDay = 1000 * 60 * 60 * 24;
    const start = toDate(startDate);
    const end = toDate(endDate);
    const diff = Math.ceil((end - start) / msPerDay);
    return Math.max(1, diff);
}

function getSeason(pickupDate, dropoffDate) {
    const start = toDate(pickupDate);
    const end = toDate(dropoffDate);
    const pickupMonth = start.getMonth();
    const dropoffMonth = end.getMonth();
    const inHigh = (m) => m >= APRIL && m <= OCTOBER;
    if (inHigh(pickupMonth) || inHigh(dropoffMonth)) return 'High';
    if (pickupMonth < APRIL && dropoffMonth >= APRIL) return 'High';
    if (pickupMonth <= OCTOBER && dropoffMonth > OCTOBER) return 'High';
    return 'Low';
}

function price(pickup, dropoff, pickupDate, dropoffDate, type, age, licenseYears) {
    const clazz = type;
    const days = getDays(pickupDate, dropoffDate);
    const season = getSeason(pickupDate, dropoffDate);

    if (age < MINIMUM_RENTAL_AGE) return 'Driver too young - cannot quote the price';
    if (age <= COMPACT_MAX_AGE && clazz !== 'Compact') return 'Drivers 21 y/o or less can only rent Compact vehicles';
    if (licenseYears < LICENSE_INELIGIBLE_YEARS) return 'Driver with license held for less than 1 year - ineligible to rent';

    let dailyPrice = age;
    let total = dailyPrice * days;

    if (clazz === "Racer" && age <= RACER_AGE_SURCHARGE && season === "High") {
        total *= RACER_SURCHARGE_FACTOR;
    }

    if (season === "High") {
        total *= HIGH_SEASON_FACTOR;
    }

    if (licenseYears < LICENSE_SHORT_YEARS) {
        total *= LICENSE_SHORT_SURCHARGE_FACTOR;
    }

    if (licenseYears < LICENSE_ADDITIONAL_FEE_YEARS && season === 'High') {
        total += LICENSE_HIGH_SEASON_DAILY_FEE * days;
    }

    if (days > LONG_RENTAL_DAYS_THRESHOLD && season !== 'High') {
        total *= LONG_RENTAL_DISCOUNT;
    }

    const finalDaily = total / days;
    if (finalDaily < age) {
        dailyPrice = age;
        total = dailyPrice * days;
    }

    return Math.round(total * 100) / 100 + ' €';
}

module.exports = { price };