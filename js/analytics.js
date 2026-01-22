const baseAnalytics = {
    parseDate: window.parseDate,
    filterByDateRange: window.filterByDateRange,
    getTotalApplications: (jobs) => {
        return jobs.filter(job => job.dateApplied).length;
    },
    getApplicationsByTimeWindow: (jobs) => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        return {
            today: window.filterByDateRange(jobs, startOfToday, null).length,
            thisWeek: window.filterByDateRange(jobs, startOfWeek, null).length,
            thisMonth: window.filterByDateRange(jobs, startOfMonth, null).length,
            lastMonth: window.filterByDateRange(jobs, startOfLastMonth, endOfLastMonth).length,
            total: baseAnalytics.getTotalApplications(jobs)
        };
    },
    getResponseRate: (jobs) => {
        const applicationsWithDate = jobs.filter(job => job.dateApplied);
        const total = applicationsWithDate.length;
        if (total === 0) return { count: 0, percentage: 0, total, waiting: 0 };
        const responded = applicationsWithDate.filter(job => {
            if (job.status === window.JOB_STATUSES.IN_PROGRESS) return true;
            const prog = job.progression || window.PROGRESSION_STAGES.APPLICATION;
            if (prog !== window.PROGRESSION_STAGES.APPLICATION) return true;
            if (job.status === window.JOB_STATUSES.CLOSED && job.closeReason === window.CLOSE_REASONS.WITHDREW) return true;
            return false;
        });
        const waiting = applicationsWithDate.filter(job => {
            return job.status === window.JOB_STATUSES.APPLIED &&
                (job.progression || window.PROGRESSION_STAGES.APPLICATION) === window.PROGRESSION_STAGES.APPLICATION;
        });
        return {
            count: responded.length,
            percentage: Math.round((responded.length / total) * 100),
            total,
            waiting: waiting.length
        };
    },
    getWaitingStatus: (jobs) => {
        const waiting = jobs.filter(job =>
            job.status === window.JOB_STATUSES.APPLIED &&
            (job.progression || window.PROGRESSION_STAGES.APPLICATION) === window.PROGRESSION_STAGES.APPLICATION
        );
        const now = new Date();
        const waitingByDuration = {
            "0-7 days": 0,
            "8-14 days": 0,
            "15-30 days": 0,
            "31-60 days": 0,
            "60+ days": 0
        };
        waiting.forEach(job => {
            if (!job.dateApplied) return;
            const appliedDate = new Date(job.dateApplied);
            const daysWaiting = Math.floor((now - appliedDate) / window.APP_CONFIG.MS_PER_DAY);
            if (daysWaiting <= 7) waitingByDuration["0-7 days"]++;
            else if (daysWaiting <= 14) waitingByDuration["8-14 days"]++;
            else if (daysWaiting <= 30) waitingByDuration["15-30 days"]++;
            else if (daysWaiting <= 60) waitingByDuration["31-60 days"]++;
            else waitingByDuration["60+ days"]++;
        });
        return { total: waiting.length, byDuration: waitingByDuration, jobs: waiting };
    },
    getInterviewConversionRate: (jobs) => {
        const applicationsWithDate = jobs.filter(job => job.dateApplied);
        const total = applicationsWithDate.length;
        if (total === 0) return { count: 0, percentage: 0, total };
        const interviewStages = [
            window.PROGRESSION_STAGES.RECRUITER_SCREEN,
            window.PROGRESSION_STAGES.PARTIAL_LOOP,
            window.PROGRESSION_STAGES.FULL_LOOP,
            window.PROGRESSION_STAGES.OFFER
        ];
        const interviewed = applicationsWithDate.filter(job => interviewStages.includes(job.progression));
        return { count: interviewed.length, percentage: Math.round((interviewed.length / total) * 100), total };
    },
    getOfferRate: (jobs) => {
        const applicationsWithDate = jobs.filter(job => job.dateApplied);
        const total = applicationsWithDate.length;
        if (total === 0) return { count: 0, percentage: 0, total };
        const offers = applicationsWithDate.filter(job => job.progression === window.PROGRESSION_STAGES.OFFER);
        return { count: offers.length, percentage: Math.round((offers.length / total) * 100), total };
    },
    getPipelineStatus: (jobs) => {
        const activePipeline = jobs.filter(job => job.status === window.JOB_STATUSES.APPLIED || job.status === window.JOB_STATUSES.IN_PROGRESS);
        const byStage = {
            [window.PROGRESSION_STAGES.APPLICATION]: 0,
            [window.PROGRESSION_STAGES.RECRUITER_SCREEN]: 0,
            [window.PROGRESSION_STAGES.PARTIAL_LOOP]: 0,
            [window.PROGRESSION_STAGES.FULL_LOOP]: 0,
            [window.PROGRESSION_STAGES.OFFER]: 0
        };
        const byStatus = {
            [window.JOB_STATUSES.APPLIED]: 0,
            [window.JOB_STATUSES.IN_PROGRESS]: 0
        };
        activePipeline.forEach(job => {
            const stage = job.progression || window.PROGRESSION_STAGES.APPLICATION;
            if (byStage.hasOwnProperty(stage)) byStage[stage]++;
            if (job.status === window.JOB_STATUSES.APPLIED) byStatus[window.JOB_STATUSES.APPLIED]++;
            else if (job.status === window.JOB_STATUSES.IN_PROGRESS) byStatus[window.JOB_STATUSES.IN_PROGRESS]++;
        });
        return { total: activePipeline.length, byStage, byStatus, jobs: activePipeline };
    },
    getClosureReasons: (jobs) => {
        const closed = jobs.filter(job => job.status === window.JOB_STATUSES.CLOSED);
        const counts = {
            [window.CLOSE_REASONS.REJECTED]: 0,
            [window.CLOSE_REASONS.GHOSTED]: 0,
            [window.CLOSE_REASONS.WITHDREW]: 0,
            "Unknown": 0
        };
        closed.forEach(job => {
            const reason = job.closeReason || "Unknown";
            if (counts.hasOwnProperty(reason)) counts[reason]++;
            else counts["Unknown"]++;
        });
        return { total: closed.length, counts };
    },
    getRejectionRate: (jobs) => {
        const closed = jobs.filter(job => job.status === window.JOB_STATUSES.CLOSED);
        const total = closed.length;
        if (total === 0) return { count: 0, percentage: 0, total };
        const rejected = closed.filter(job => job.closeReason === window.CLOSE_REASONS.REJECTED);
        return { count: rejected.length, percentage: Math.round((rejected.length / total) * 100), total };
    },
    getClosedProgressionBreakdown: (jobs) => {
        const closed = jobs.filter(job => job.status === window.JOB_STATUSES.CLOSED);
        const byProgression = {
            [window.PROGRESSION_STAGES.APPLICATION]: 0,
            [window.PROGRESSION_STAGES.RECRUITER_SCREEN]: 0,
            [window.PROGRESSION_STAGES.PARTIAL_LOOP]: 0,
            [window.PROGRESSION_STAGES.FULL_LOOP]: 0,
            [window.PROGRESSION_STAGES.OFFER]: 0
        };
        closed.forEach(job => {
            const prog = job.progression || window.PROGRESSION_STAGES.APPLICATION;
            if (byProgression.hasOwnProperty(prog)) byProgression[prog]++;
        });
        return { total: closed.length, byProgression };
    },
    getApplicationsPerWeek: (jobs) => {
        const jobsWithDates = jobs.filter(job => job.dateApplied);
        const weekMap = {};
        jobsWithDates.forEach(job => {
            const date = window.parseDate(job.dateApplied);
            if (!date) return;
            const weekKey = window.getWeekYear(date);
            weekMap[weekKey] = (weekMap[weekKey] || 0) + 1;
        });
        const weeks = Object.entries(weekMap)
            .map(([week, count]) => ({ week, count }))
            .sort((a, b) => a.week.localeCompare(b.week));
        const totalWeeks = weeks.length;
        const totalApps = weeks.reduce((sum, w) => sum + w.count, 0);
        const average = totalWeeks > 0 ? Math.round(totalApps / totalWeeks) : 0;
        return { byWeek: weeks, average, total: totalApps };
    },
    getApplicationsPerMonth: (jobs) => {
        const jobsWithDates = jobs.filter(job => job.dateApplied);
        const monthMap = {};
        jobsWithDates.forEach(job => {
            const date = window.parseDate(job.dateApplied);
            if (!date) return;
            const monthKey = window.getMonthYear(date);
            monthMap[monthKey] = (monthMap[monthKey] || 0) + 1;
        });
        const months = Object.entries(monthMap)
            .map(([month, count]) => {
                const [year, monthNum] = month.split('-');
                const date = new Date(parseInt(year), parseInt(monthNum) - 1);
                const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
                return { month, label, count };
            })
            .sort((a, b) => a.month.localeCompare(b.month));
        const totalMonths = months.length;
        const totalApps = months.reduce((sum, m) => sum + m.count, 0);
        const average = totalMonths > 0 ? Math.round(totalApps / totalMonths) : 0;
        return { byMonth: months, average, total: totalApps };
    },
    getResponseRateByMonth: (jobs) => {
        const monthMap = {};
        jobs.forEach(job => {
            if (!job.followUp) return;
            const date = window.parseDate(job.followUp);
            if (!date) return;
            const monthKey = window.getMonthYear(date);
            if (!monthMap[monthKey]) monthMap[monthKey] = { followUps: 0, responded: 0 };
            monthMap[monthKey].followUps++;
            if (job.progression && job.progression !== window.PROGRESSION_STAGES.APPLICATION) monthMap[monthKey].responded++;
        });
        const months = Object.entries(monthMap)
            .map(([month, data]) => {
                const [year, monthNum] = month.split('-');
                const date = new Date(parseInt(year), parseInt(monthNum) - 1);
                const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
                const responsePercentage = data.followUps > 0 ? Math.round((data.responded / data.followUps) * 100) : 0;
                return { month, label, followUps: data.followUps, responded: data.responded, responsePercentage };
            })
            .sort((a, b) => a.month.localeCompare(b.month));
        return months;
    },
    getHotApplicationPeriods: (jobs) => {
        const monthlyData = baseAnalytics.getApplicationsPerMonth(jobs);
        const hotThreshold = monthlyData.average * window.APP_CONFIG.HOT_PERIOD_MULTIPLIER;
        const hotPeriods = monthlyData.byMonth
            .filter(item => item.count >= hotThreshold)
            .map(item => ({
                period: item.label,
                applications: item.count,
                vsAverage: Math.round(((item.count - monthlyData.average) / monthlyData.average) * 100)
            }));
        return { hotPeriods, threshold: Math.round(hotThreshold), average: monthlyData.average };
    },
    getHotResponsePeriods: (jobs) => {
        const monthlyResponses = baseAnalytics.getResponseRateByMonth(jobs);
        const totalApps = monthlyResponses.reduce((sum, item) => sum + item.total, 0);
        const totalResponses = monthlyResponses.reduce((sum, item) => sum + item.responded, 0);
        const overallAverage = totalApps > 0 ? (totalResponses / totalApps) * 100 : 0;
        const hotThreshold = overallAverage * window.APP_CONFIG.HOT_PERIOD_MULTIPLIER;
        const hotPeriods = monthlyResponses
            .filter(item => item.percentage >= hotThreshold && item.total >= 3)
            .map(item => ({
                period: item.label,
                responseRate: item.percentage,
                applications: item.total,
                responses: item.responded
            }));
        return { hotPeriods, threshold: Math.round(hotThreshold), average: Math.round(overallAverage) };
    },
    getApplicationsByCompany: (jobs) => {
        const jobsWithDates = jobs.filter(job => job.dateApplied);
        const companyData = {};
        jobsWithDates.forEach(job => {
            const company = job.company || "Unknown";
            if (!companyData[company]) {
                companyData[company] = { total: 0, applied: 0, inProgress: 0, closed: 0, responded: 0, rejected: 0, offers: 0 };
            }
            companyData[company].total++;
            if (job.status === window.JOB_STATUSES.APPLIED) companyData[company].applied++;
            else if (job.status === window.JOB_STATUSES.IN_PROGRESS) companyData[company].inProgress++;
            else if (job.status === window.JOB_STATUSES.CLOSED) companyData[company].closed++;
            const prog = job.progression || window.PROGRESSION_STAGES.APPLICATION;
            if (job.status === window.JOB_STATUSES.IN_PROGRESS || prog !== window.PROGRESSION_STAGES.APPLICATION) companyData[company].responded++;
            if (job.closeReason === window.CLOSE_REASONS.REJECTED) companyData[company].rejected++;
            if (prog === window.PROGRESSION_STAGES.OFFER) companyData[company].offers++;
        });
        const companies = Object.entries(companyData)
            .map(([name, data]) => ({
                name, ...data,
                responseRate: data.total > 0 ? Math.round((data.responded / data.total) * 100) : 0
            }))
            .sort((a, b) => b.total - a.total);
        return companies;
    },
    getSuccessRateByPriority: (jobs) => {
        const jobsWithDates = jobs.filter(job => job.dateApplied);
        const priorityData = {};
        Object.values(window.PRIORITY_TIERS).forEach(tier => {
            priorityData[tier] = { total: 0, responded: 0, interviewed: 0, offers: 0 };
        });
        const interviewStages = [
            window.PROGRESSION_STAGES.RECRUITER_SCREEN,
            window.PROGRESSION_STAGES.PARTIAL_LOOP,
            window.PROGRESSION_STAGES.FULL_LOOP,
            window.PROGRESSION_STAGES.OFFER
        ];
        jobsWithDates.forEach(job => {
            const tier = job.priority || window.PRIORITY_TIERS.TIER_3;
            if (priorityData[tier]) {
                priorityData[tier].total++;
                if (job.status === window.JOB_STATUSES.IN_PROGRESS || (job.progression && job.progression !== window.PROGRESSION_STAGES.APPLICATION)) priorityData[tier].responded++;
                if (job.progression && interviewStages.includes(job.progression)) priorityData[tier].interviewed++;
                if (job.progression === window.PROGRESSION_STAGES.OFFER) priorityData[tier].offers++;
            }
        });
        const result = Object.entries(priorityData).map(([tier, data]) => {
            const responseRate = data.total > 0 ? Math.round((data.responded / data.total) * 100) : 0;
            const interviewRate = data.total > 0 ? Math.round((data.interviewed / data.total) * 100) : 0;
            const offerRate = data.total > 0 ? Math.round((data.offers / data.total) * 100) : 0;
            return { tier, total: data.total, responded: data.responded, interviewed: data.interviewed, offers: data.offers, responseRate, interviewRate, offerRate };
        });
        return result;
    },
    getMostResponsiveCompanies: (jobs, minApplications = window.APP_CONFIG.MIN_APPLICATIONS_FOR_COMPANY_STATS) => {
        const companies = baseAnalytics.getApplicationsByCompany(jobs);
        return companies.filter(company => company.total >= minApplications).sort((a, b) => b.responseRate - a.responseRate).slice(0, 10);
    },
    getProgressionBreakdownForResponded: (jobs) => {
        const responded = jobs.filter(job => job.progression && job.progression !== window.PROGRESSION_STAGES.APPLICATION);
        const byProgression = {
            [window.PROGRESSION_STAGES.RECRUITER_SCREEN]: 0,
            [window.PROGRESSION_STAGES.PARTIAL_LOOP]: 0,
            [window.PROGRESSION_STAGES.FULL_LOOP]: 0,
            [window.PROGRESSION_STAGES.OFFER]: 0
        };
        responded.forEach(job => {
            const prog = job.progression || window.PROGRESSION_STAGES.APPLICATION;
            if (byProgression.hasOwnProperty(prog)) byProgression[prog]++;
        });
        return Object.entries(byProgression).filter(([_, count]) => count > 0).map(([stage, count]) => ({ label: stage, value: count }));
    },
    getJobSearchOverview: (jobs) => {
        return {
            totalApplications: baseAnalytics.getTotalApplications(jobs),
            byTimeWindow: baseAnalytics.getApplicationsByTimeWindow(jobs),
            responseRate: baseAnalytics.getResponseRate(jobs),
            interviewConversionRate: baseAnalytics.getInterviewConversionRate(jobs),
            offerRate: baseAnalytics.getOfferRate(jobs),
            pipeline: baseAnalytics.getPipelineStatus(jobs),
            waiting: baseAnalytics.getWaitingStatus(jobs),
            closureReasons: baseAnalytics.getClosureReasons(jobs),
            rejectionRate: baseAnalytics.getRejectionRate(jobs),
            closedProgression: baseAnalytics.getClosedProgressionBreakdown(jobs)
        };
    },
    getTimeBasedAnalytics: (jobs) => {
        return {
            applicationsPerWeek: baseAnalytics.getApplicationsPerWeek(jobs),
            applicationsPerMonth: baseAnalytics.getApplicationsPerMonth(jobs),
            responseRateByMonth: baseAnalytics.getResponseRateByMonth(jobs),
            hotApplicationPeriods: baseAnalytics.getHotApplicationPeriods(jobs),
            hotResponsePeriods: baseAnalytics.getHotResponsePeriods(jobs)
        };
    },
    getCompanyPriorityAnalytics: (jobs) => {
        return {
            applicationsByCompany: baseAnalytics.getApplicationsByCompany(jobs),
            successRateByPriority: baseAnalytics.getSuccessRateByPriority(jobs),
            mostResponsiveCompanies: baseAnalytics.getMostResponsiveCompanies(jobs)
        };
    },
    getCompleteAnalytics: (jobs) => {
        return {
            overview: baseAnalytics.getJobSearchOverview(jobs),
            timeBased: baseAnalytics.getTimeBasedAnalytics(jobs),
            companyPriority: baseAnalytics.getCompanyPriorityAnalytics(jobs),
            generatedAt: new Date().toISOString()
        };
    }
};

const cachedAnalytics = (() => {
    const original = baseAnalytics;
    return {
        getJobSearchOverview(jobs) {
            const cacheKey = `overview_${jobs.length}_${jobs.map(j => j.id).join('-').substring(0, 50)}`;
            return window.PerformanceUtil.memoize(cacheKey, () => {
                return window.PerformanceUtil.measure('analytics:overview', () => original.getJobSearchOverview(jobs));
            }, 30000);
        },
        getTimeBasedAnalytics(jobs) {
            const cacheKey = `timebased_${jobs.length}_${jobs.map(j => j.dateApplied).join('-').substring(0, 50)}`;
            return window.PerformanceUtil.memoize(cacheKey, () => {
                return window.PerformanceUtil.measure('analytics:timebased', () => original.getTimeBasedAnalytics(jobs));
            }, 30000);
        },
        getCompanyPriorityAnalytics(jobs) {
            const cacheKey = `company_${jobs.length}_${jobs.map(j => j.company).join('-').substring(0, 50)}`;
            return window.PerformanceUtil.memoize(cacheKey, () => {
                return window.PerformanceUtil.measure('analytics:company', () => original.getCompanyPriorityAnalytics(jobs));
            }, 30000);
        },
        getCompleteAnalytics(jobs) {
            const cacheKey = `complete_${jobs.length}_${jobs.map(j => j.id).join('-').substring(0, 50)}`;
            return window.PerformanceUtil.memoize(cacheKey, () => {
                return window.PerformanceUtil.measure('analytics:complete', () => original.getCompleteAnalytics(jobs));
            }, 30000);
        },
        getApplicationsPerMonth: original.getApplicationsPerMonth,
        getMostResponsiveCompanies: original.getMostResponsiveCompanies,
        getProgressionBreakdownForResponded: original.getProgressionBreakdownForResponded
    };
})();

window.analytics = cachedAnalytics;