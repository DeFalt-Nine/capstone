
/**
 * Advanced date parsing for local event strings like "March", "June 16", "November", "March (Month-long)"
 */
export const parseEventDates = (dateStr: string) => {
    if (!dateStr) return null;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    
    // Normalize string: lowercase, remove commas, handle extra spaces
    const str = dateStr.toLowerCase().trim().replace(/,/g, '').replace(/\s+/g, ' ');
    const months = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
    
    try {
        const yearMatch = str.match(/\d{4}/);
        const year = yearMatch ? parseInt(yearMatch[0]) : currentYear;

        const findMonth = (s: string) => {
            for (let i = 0; i < months.length; i++) {
                if (s.includes(months[i]) || (months[i].length > 3 && s.includes(months[i].substring(0, 3)))) return i;
            }
            return -1;
        };

        const findDay = (s: string) => {
            const numbers = s.match(/\d+/g);
            if (!numbers) return 1;
            const possibleDays = numbers.filter(n => n.length < 4 && parseInt(n) <= 31);
            if (possibleDays.length > 0) return parseInt(possibleDays[0]);
            return 1;
        };

        // Handle ISO-like dates (YYYY-MM-DD or MM/DD/YYYY)
        const dateMatch = str.match(/(\d{1,4})[/-](\d{1,2})[/-](\d{1,4})/);
        if (dateMatch) {
            const d1 = parseInt(dateMatch[1]);
            const d2 = parseInt(dateMatch[2]);
            const d3 = parseInt(dateMatch[3]);
            if (d1 > 31) return { start: new Date(d1, d2 - 1, d3), end: new Date(d1, d2 - 1, d3, 23, 59, 59) };
            return { start: new Date(d3, d1 - 1, d2), end: new Date(d3, d1 - 1, d2, 23, 59, 59) };
        }

        if (str.includes(' to ') || str.includes(' - ')) {
            const separator = str.includes(' to ') ? ' to ' : ' - ';
            const parts = str.split(separator);
            const startPart = parts[0];
            const endPart = parts[1];

            const startMonth = findMonth(startPart);
            const endMonth = findMonth(endPart);
            
            const startDay = findDay(startPart);
            const endDay = findDay(endPart);

            const resolvedStartMonth = startMonth !== -1 ? startMonth : (endMonth !== -1 ? endMonth : currentMonth);
            const resolvedEndMonth = endMonth !== -1 ? endMonth : resolvedStartMonth;

            const start = new Date(year, resolvedStartMonth, startDay);
            const end = new Date(year, resolvedEndMonth, endDay, 23, 59, 59);

            if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
                return { start, end };
            }
        }

        const month = findMonth(str);
        if (month !== -1) {
            const dayMatch = str.match(/\b([1-9]|[12][0-9]|3[01])\b/);
            const explicitDay = dayMatch ? parseInt(dayMatch[0]) : null;

            if (str.includes('month-long') || str.includes('entire month') || !explicitDay) {
                const start = new Date(year, month, 1);
                const end = new Date(year, month + 1, 0, 23, 59, 59);
                return { start, end };
            } else {
                const start = new Date(year, month, explicitDay);
                const end = new Date(year, month, explicitDay, 23, 59, 59);
                return { start, end };
            }
        }
    } catch (err) {
        console.error("Date parsing error for:", dateStr, err);
    }
    return null;
};

/**
 * Enhanced status calculation for both Mascot and UI
 */
export const getEventStatus = (dateStr: string) => {
    const now = new Date();
    const nowTime = now.getTime();
    const dates = parseEventDates(dateStr);
    
    if (!dates) return { type: 'unknown', label: '', color: '', timeLeft: 0, targetDate: null };

    const startTime = dates.start.getTime();
    const endTime = dates.end.getTime();

    // If the event has "Ended" but it's a recurring yearly event and user is seeing it in current year
    // it helps to push it to the next year for Mascot logic if it already passed.
    if (nowTime > endTime) {
        // Only return 'ended' if we aren't explicitly asking for 'next occurrence'
        return { type: 'ended', label: 'Ended', color: 'bg-slate-500', timeLeft: 0, targetDate: dates.end };
    }

    if (nowTime >= startTime && nowTime <= endTime) {
        return { 
            type: 'ongoing', 
            label: 'Ongoing', 
            color: 'bg-red-500', 
            timeLeft: endTime - nowTime,
            targetDate: dates.end 
        };
    }

    return { 
        type: 'upcoming', 
        label: 'Upcoming', 
        color: 'bg-lt-yellow', 
        timeLeft: startTime - nowTime,
        targetDate: dates.start
    };
};

export const formatCountdown = (diff: number) => {
    if (diff <= 0) return "";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
    return `${mins}m ${secs}s`;
};
