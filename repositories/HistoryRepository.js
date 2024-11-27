const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
dayjs.extend(utc);
const isoWeek = require("dayjs/plugin/isoWeek");
dayjs.extend(isoWeek);
const Video = require("../entities/VideoEntity");
const WatchHistory = require("../entities/HistoryEntity");
const mongoose = require("mongoose");

class HistoryRepository {
  // Create a new history
  async createHistoryRecordRepository(data, session) {
    try {
      const { videoId, userId } = data;

      // Soft delete any existing records
      await WatchHistory.updateMany(
        { videoId, userId, isDeleted: false },
        { $set: { isDeleted: true, lastUpdated: new Date() } },
        { session }
      );

      // Create a new history record
      const newHistory = new WatchHistory({
        videoId,
        userId,
      });

      await newHistory.save({ session });

      return newHistory;
    } catch (error) {
      throw new Error(`Error creating a new history record: ${error.message}`);
    }
  }

  // Get all history records
  async getAllHistoryRecordsRepository(userId, query) {
    try {
      const page = parseInt(query.page) || 1;
      const size = parseInt(query.size, 10) || 10;
      const skip = (page - 1) * size;

      const searchQuery = {
        userId: new mongoose.Types.ObjectId(userId),
        isDeleted: false,
      };
      const sortField = query.sortField || "lastUpdated"; // Default sort field
      const sortOrder = query.order === "ascending" ? 1 : -1;

      // Construct the pipeline dynamically
      const pipeline = [
        {
          $match: searchQuery,
        },
        {
          $lookup: {
            from: "videos",
            localField: "videoId",
            foreignField: "_id",
            as: "video",
          },
        },
        {
          $unwind: "$video",
        },
      ];

      // Add a title match stage if query.title exists
      if (query.title) {
        pipeline.push({
          $match: {
            "video.title": { $regex: query.title, $options: "i" },
          },
        });
      }

      pipeline.push(
        {
          $lookup: {
            from: "videolikehistories",
            let: { videoId: "$_id" },
            pipeline: [
              { $match: { $expr: { $eq: ["$video", "$$videoId"] } } },
              { $count: "likesCount" },
            ],
            as: "likesInfo",
          },
        },
        {
          $addFields: {
            likesCount: {
              $ifNull: [{ $arrayElemAt: ["$likesInfo.likesCount", 0] }, 0],
            },
          },
        },
        {
          $project: {
            _id: 1,
            userId: 1,
            dateCreated: 1,
            lastUpdated: 1,
            video: {
              _id: 1,
              title: 1,
              description: 1,
              thumbnailUrl: 1,
              numOfViews: 1,
              likesCount: 1,
            },
          },
        },
        {
          $sort: { [sortField]: sortOrder },
        },
        {
          $skip: skip,
        },
        {
          $limit: Number(size),
        }
      );

      // Fetch total records count
      const totalRecords = await WatchHistory.aggregate([
        { $match: searchQuery },
      ]);

      // Fetch paginated history records
      const historyRecords = await WatchHistory.aggregate(pipeline);

      return {
        historyRecords,
        total: totalRecords.length,
        page: Number(page),
        totalPages: Math.ceil(totalRecords.length / Number(size)),
      };
    } catch (error) {
      throw new Error(`Error getting history records: ${error.message}`);
    }
  }

  async getHistoryRecordRepository(historyId) {
    try {
      const historyRecord = await WatchHistory.findOne({
        _id: mongoose.Types.ObjectId(historyId),
        isDeleted: false,
      });

      if (!historyRecord) {
        throw new Error("History record not found");
      }

      return historyRecord;
    } catch (error) {
      throw new Error(`Error fetching history record: ${error.message}`);
    }
  }

  // Clear all history of associated userId
  async clearAllHistoryRecordsRepository(userId) {
    try {
      const result = await WatchHistory.deleteMany({ userId: userId });
      if (result && result.deletedCount === 0) {
        return false;
      }
      return true;
    } catch (error) {
      throw new Error(`Error clearing history: ${error.message}`);
    }
  }

  async deleteHistoryRecordRepository(historyId) {
    try {
      const result = await WatchHistory.findByIdAndDelete(historyId);
      if (!result) {
        throw new Error("History record not found");
      }

      return result;
    } catch (error) {
      throw new Error(`Error deleting history record: ${error.message}`);
    }
  }
  async getViewStatisticRepository(ownerId, TimeUnit, value) {
    try {
      const today = dayjs().utc(); // Ensure UTC reference
      let currentIntervals = []; // Array for current intervals
      let previousIntervals = []; // Array for previous intervals
      let unit = {};
      const generateIntervals = (
        timeUnit,
        currentStart,
        duration,
        incrementMethod
      ) => {
        const intervals = [];
        if (timeUnit === "month") {
          for (let i = 1; i < duration + 1; i++) {
            const start = currentStart
              .add(i, incrementMethod)
              .startOf(timeUnit);
            const end = currentStart.add(i, incrementMethod).endOf(timeUnit);
            intervals.push({
              startDate: start.format("YYYY-MM-DDTHH:mm:ss[Z]"),
              endDate: end.format("YYYY-MM-DDTHH:mm:ss[Z]"),
            });
          }
        } else {
          for (let i = 0; i < duration; i++) {
            const start = currentStart
              .add(i, incrementMethod)
              .startOf(timeUnit);
            const end = currentStart.add(i, incrementMethod).endOf(timeUnit);
            intervals.push({
              startDate: start.format("YYYY-MM-DDTHH:mm:ss[Z]"),
              endDate: end.format("YYYY-MM-DDTHH:mm:ss[Z]"),
            });
          }
        }
        return intervals;
      };

      switch (TimeUnit) {
        case "DAY":
          currentIntervals.push({
            startDate: today.startOf("day").format("YYYY-MM-DDTHH:mm:ss[Z]"),
            endDate: today.endOf("day").format("YYYY-MM-DDTHH:mm:ss[Z]"),
          });
          unit.xCollumn = "Days";
          unit.yCollumn = "Views";
          unit.name = "Today's view";
          unit.previous = "yesterday";
          previousIntervals.push({
            startDate: today
              .subtract(1, "day")
              .startOf("day")
              .format("YYYY-MM-DDTHH:mm:ss[Z]"),
            endDate: today
              .subtract(1, "day")
              .endOf("day")
              .format("YYYY-MM-DDTHH:mm:ss[Z]"),
          });
          break;

        case "WEEK":
          let weekStart = today.startOf("isoWeek");
          let prevWeekStart = weekStart.subtract(1, "week");
          unit.xCollumn = "Days";
          unit.yCollumn = "Views";
          unit.name = "This week's view";
          unit.previous = "the previous week";
          currentIntervals = generateIntervals("day", weekStart, 7, "day");
          previousIntervals = generateIntervals("day", prevWeekStart, 7, "day");
          break;

        case "MONTH":
          unit.xCollumn = "Days";
          unit.yCollumn = "Views";
          unit.name = "This month's view";
          unit.previous = "the previous month";
          const targetMonth =
            value != null &&
            value != undefined &&
            !isNaN(value) &&
            Number.isInteger(value) &&
            value > 0 &&
            value < 13
              ? value
              : today.month();
          // console.log("This month: ", targetMonth);
          const currentMonthStart = today
            .year(today.year())
            .month(targetMonth)
            .startOf("month");
          const previousMonthStart = currentMonthStart.subtract(1, "month");
          const daysInCurrentMonth = currentMonthStart.daysInMonth();
          const daysInPreviousMonth = previousMonthStart.daysInMonth();

          currentIntervals = generateIntervals(
            "day",
            currentMonthStart,
            daysInCurrentMonth,
            "day"
          );
          previousIntervals = generateIntervals(
            "day",
            previousMonthStart,
            daysInPreviousMonth,
            "day"
          );
          break;

        case "YEAR":
          unit.xCollumn = "Months";
          unit.yCollumn = "Views";
          unit.name = "This year's view";
          unit.previous = "the previous year";
          const targetYear =
            value != null &&
            value != undefined &&
            !isNaN(value) &&
            Number.isInteger(value) &&
            value > 2024
              ? value
              : today.year();
          const currentYearStart = dayjs(`${targetYear}-01-01`).utc();
          const previousYearStart = currentYearStart.subtract(1, "year");
          console.log("This year: ", targetYear);
          currentIntervals = generateIntervals(
            "month",
            currentYearStart,
            12,
            "month"
          );
          previousIntervals = generateIntervals(
            "month",
            previousYearStart,
            12,
            "month"
          );
          break;

        default:
          throw new Error(`Invalid TimeUnit: ${TimeUnit}`);
      }

      // Helper function to process intervals
      const processIntervals = async (intervals) => {
        const results = [];
        let totalViews = 0;

        for (const interval of intervals) {
          const views = await this.ViewOnInterval(
            ownerId,
            interval.startDate,
            interval.endDate
          );
          totalViews += views;
          results.push({
            date: interval.startDate.split("T")[0], // Extract date only
            views,
          });
        }
        return { results, totalViews };
      };

      // Process current and previous intervals
      const currentData = await processIntervals(currentIntervals);
      const previousData = await processIntervals(previousIntervals);

      let descriptionString = "";
      currentData.totalViews >= previousData.totalViews
        ? (descriptionString += `Increased ${
            currentData.totalViews - previousData.totalViews
          } views compared to ${unit.previous}`)
        : (descriptionString += `Decreased ${
            previousData.totalViews - currentData.totalViews
          } views compared to ${unit.previous}`);

      // //debug
      // console.log({
      //   title: unit.name,
      //   xAxis: unit.xCollumn,
      //   yAxis: unit.yCollumn,
      //   data: currentData.results,
      //   total: currentData.totalViews,
      //   description: descriptionString,
      // });

      // Format and return the results
      return {
        title: unit.name,
        xAxis: unit.xCollumn,
        yAxis: unit.yCollumn,
        data: currentData.results,
        total: currentData.totalViews,
        description: descriptionString,
      };
    } catch (error) {
      throw new Error(`Error getting view statistics: ${error.message}`);
    }
  }

  async ViewOnInterval(ownerId, startTime, endTime) {
    try {
      const videoIds = await Video.find(
        {
          userId: new mongoose.Types.ObjectId(ownerId),
          isDeleted: false,
          enumMode: { $nin: ["private", "draft"] },
        },
        { _id: 1 }
      );

      if (!videoIds || videoIds.length === 0) {
        return 0;
      }

      // Extract video IDs
      const videoIdArray = videoIds.map((video) => video._id);

      // Count WatchHistory entries in the given interval
      const counts = await Promise.all(
        videoIdArray.map(async (id) => {
          const watchHistories = await WatchHistory.find({
            videoId: id,
            dateCreated: { $gte: startTime, $lte: endTime },
          });
          return watchHistories.length;
        })
      );

      // //debugging
      // console.log(
      //   `Views from ${startTime} to ${endTime}: c${counts.reduce(
      //     (total, num) => total + num,
      //     0
      //   )}`
      // );

      // Sum all counts
      return counts.reduce((total, num) => total + num, 0);
    } catch (error) {
      throw new Error(`Error getting view statistic: ${error.message}`);
    }
  }
}

module.exports = HistoryRepository;
