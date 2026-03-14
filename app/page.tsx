"use client";

import { useEffect, useState } from "react";

type DrawRecord = {
  id: string;
  year: number;
  number: number;
  drawDate: string;
  drawnAt: string;
};

export default function Home() {
  const [calendarContext, setCalendarContext] = useState<{
    year: number;
    today: string;
    startOfYear: string;
  } | null>(null);

  const [history, setHistory] = useState<DrawRecord[]>([]);
  const [allDrawsToToday, setAllDrawsToToday] = useState<DrawRecord[]>([]);
  const [missingDates, setMissingDates] = useState<string[]>([]);

  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLoadingMissingDates, setIsLoadingMissingDates] = useState(true);
  const [isDrawing, setIsDrawing] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);

  const pageSize = 5;

  const year = calendarContext?.year ?? 0;
  const today = calendarContext?.today ?? "";
  const startOfYear = calendarContext?.startOfYear ?? "";

  function formatLocalDate(date: Date) {
    const yearPart = date.getFullYear();
    const monthPart = String(date.getMonth() + 1).padStart(2, "0");
    const dayPart = String(date.getDate()).padStart(2, "0");

    return `${yearPart}-${monthPart}-${dayPart}`;
  }

  function formatDisplayDate(isoDate: string) {
    if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
      return isoDate;
    }

    const [yearPart, monthPart, dayPart] = isoDate.split("-");
    return `${dayPart}/${monthPart}/${yearPart}`;
  }

  function formatVnd(amount: number) {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  function formatDateTime(dateValue: string) {
    return new Intl.DateTimeFormat("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(new Date(dateValue));
  }

  function buildDateRange(fromDate: string, toDate: string) {
    const dates: string[] = [];

    const [fromYear, fromMonth, fromDay] = fromDate.split("-").map(Number);
    const [toYear, toMonth, toDay] = toDate.split("-").map(Number);

    const cursor = new Date(Date.UTC(fromYear, fromMonth - 1, fromDay));
    const end = new Date(Date.UTC(toYear, toMonth - 1, toDay));

    while (cursor <= end) {
      dates.push(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    return dates;
  }

  async function loadMissingDatesAndResults() {
    if (!calendarContext) {
      return;
    }

    try {
      setIsLoadingMissingDates(true);
      setError(null);

      const res = await fetch(
        `/api/history?year=${year}&all=1&toDate=${today}`,
      );

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(
          payload?.message || "Không thể tải dữ liệu ngày chưa quay.",
        );
      }

      const json = await res.json();
      const data = json.data as DrawRecord[];

      setAllDrawsToToday(data);

      const drawnDateSet = new Set(data.map((item) => item.drawDate));
      const datesFromYearStart = buildDateRange(startOfYear, today);

      setMissingDates(
        datesFromYearStart.filter((date) => !drawnDateSet.has(date)),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.",
      );
    } finally {
      setIsLoadingMissingDates(false);
    }
  }

  async function load() {
    if (!calendarContext) {
      return;
    }

    try {
      setIsLoadingHistory(true);
      setError(null);

      const res = await fetch(
        `/api/history?year=${year}&page=${page}&pageSize=${pageSize}`,
      );

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.message || "Không thể tải lịch sử quay số.");
      }

      const json = await res.json();
      const data = json.data as DrawRecord[];

      setHistory(data);
      setHistoryTotal(json.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.",
      );
    } finally {
      setIsLoadingHistory(false);
    }
  }

  async function draw() {
    if (!calendarContext || !today) {
      return;
    }

    try {
      setIsDrawing(true);
      setError(null);

      const res = await fetch("/api/draw", {
        method: "POST",
        body: JSON.stringify({
          year,
          drawDate: today,
        }),
      });

      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(
          payload?.message || "Quay số thất bại, vui lòng thử lại.",
        );
      }

      await loadMissingDatesAndResults();

      if (page !== 1) {
        setPage(1);
      } else {
        await load();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định.",
      );
    } finally {
      setIsDrawing(false);
    }
  }

  useEffect(() => {
    const now = new Date();
    const todayValue = formatLocalDate(now);
    const yearValue = now.getFullYear();

    setCalendarContext({
      year: yearValue,
      today: todayValue,
      startOfYear: `${yearValue}-01-01`,
    });
  }, []);

  useEffect(() => {
    if (!calendarContext) {
      return;
    }

    load();
  }, [page, calendarContext]);

  useEffect(() => {
    if (!calendarContext) {
      return;
    }

    loadMissingDatesAndResults();
  }, [calendarContext]);

  const totalPages = Math.max(1, Math.ceil(historyTotal / pageSize));
  const isBusy = isLoadingHistory || isLoadingMissingDates || isDrawing;

  const todayResult =
    allDrawsToToday.find((item) => item.drawDate === today) || null;
  const isTodayDrawn = Boolean(todayResult);

  const isDrawDisabled =
    isDrawing || !calendarContext || !today || isTodayDrawn;

  const totalDrawnNumberInYear = allDrawsToToday.reduce(
    (sum, record) => sum + record.number,
    0,
  );

  const totalSavedAmount = totalDrawnNumberInYear * 1000;

  return (
    <main className="mx-auto max-w-5xl space-y-6" suppressHydrationWarning>
      <section className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-center lg:text-left">
              Tiết kiệm ngẫu nhiên
            </h1>

            <p className="mt-1 hidden text-sm text-blue-100 sm:block">
              Quay số ngẫu nhiên theo ngày trong năm{" "}
              {calendarContext ? year : "----"}
            </p>
          </div>

          <p className="text-center text-sm text-blue-100 sm:hidden">
            Quay số ngẫu nhiên theo ngày trong năm{" "}
            {calendarContext ? year : "----"}
          </p>

          <div className="rounded-2xl border border-white/30 bg-white/15 px-5 py-4 text-left shadow-sm sm:text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-100/90">
              Tổng tiền đã tiết kiệm
            </p>
            <p className="mt-1 text-3xl font-extrabold leading-none text-white">
              {formatVnd(totalSavedAmount)}
            </p>
          </div>
        </div>

        {isBusy && (
          <div className="mt-4 flex items-center gap-2 text-sm text-blue-50">
            <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            {isDrawing ? "Đang quay số..." : "Đang tải dữ liệu..."}
          </div>
        )}
      </section>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 md:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Kết quả hôm nay
              </p>
              <p className="mt-1 text-xs text-gray-400">
                {calendarContext
                  ? `Ngày hiện tại: ${formatDisplayDate(today)}`
                  : "Đang khởi tạo mốc thời gian..."}
              </p>
            </div>

            <button
              onClick={draw}
              disabled={isDrawDisabled}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isDrawing && (
                <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}
              {isDrawing
                ? "Đang quay..."
                : isTodayDrawn
                  ? "Đã quay hôm nay"
                  : "Quay số hôm nay"}
            </button>
          </div>

          {isTodayDrawn && (
            <p className="mt-3 text-sm text-amber-600">
              Hôm nay đã có kết quả, không thể quay lại.
            </p>
          )}

          <div className="mt-5 rounded-xl border border-dashed border-blue-200 bg-blue-50 p-5">
            {todayResult ? (
              <div className="flex flex-wrap items-end gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-blue-500">
                    Số đã quay
                  </p>
                  <p className="text-4xl font-bold leading-none text-blue-700">
                    #{todayResult.number}
                  </p>
                </div>

                <div className="text-sm text-blue-700">
                  <p>Ngày quay: {formatDisplayDate(todayResult.drawDate)}</p>
                  <p>Thời gian: {formatDateTime(todayResult.drawnAt)}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-blue-700">
                Hôm nay chưa có kết quả, nhấn “Quay số hôm nay” để bắt đầu.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <p className="text-sm text-gray-500">Ngày chưa quay</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {missingDates.length}
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Tính từ đầu năm đến hôm nay.
          </p>

          <div className="mt-4 max-h-44 space-y-2 overflow-auto rounded-lg bg-gray-50 p-3">
            {isLoadingMissingDates ? (
              <p className="text-xs text-gray-500">Đang tải danh sách...</p>
            ) : missingDates.length === 0 ? (
              <p className="text-xs text-emerald-600">
                Tất cả các ngày đã quay số.
              </p>
            ) : (
              missingDates.map((date) => (
                <div
                  key={date}
                  className="rounded-md bg-white px-2 py-1 text-xs text-gray-600 ring-1 ring-gray-200"
                >
                  {formatDisplayDate(date)}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Lịch sử quay số
          </h2>
        </div>

        <div className="md:hidden px-4 py-4">
          {isLoadingHistory ? (
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-6 text-center text-gray-500">
              <span className="inline-flex items-center gap-2">
                <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                Đang tải lịch sử...
              </span>
            </div>
          ) : history.length === 0 ? (
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-6 text-center text-gray-500">
              Chưa có dữ liệu quay số.
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((h) => (
                <div
                  key={h.id}
                  className="rounded-xl border border-gray-100 bg-white p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Ngày</p>
                    <p className="text-sm font-medium text-gray-700">
                      {formatDisplayDate(h.drawDate)}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-sm text-gray-500">Kết quả</p>
                    <p className="text-base font-semibold text-gray-900">
                      #{h.number}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-sm text-gray-500">Thời gian quay</p>
                    <p className="text-right text-sm text-gray-600">
                      {formatDateTime(h.drawnAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-5 py-3 font-medium">Ngày</th>
                <th className="px-5 py-3 font-medium">Kết quả</th>
                <th className="px-5 py-3 font-medium">Thời gian Quay</th>
              </tr>
            </thead>

            <tbody>
              {isLoadingHistory ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-8 text-center text-gray-500"
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                      Đang tải lịch sử...
                    </span>
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-5 py-8 text-center text-gray-500"
                  >
                    Chưa có dữ liệu quay số.
                  </td>
                </tr>
              ) : (
                history.map((h) => (
                  <tr
                    key={h.id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-5 py-3 text-gray-700">
                      {formatDisplayDate(h.drawDate)}
                    </td>

                    <td className="px-5 py-3 font-semibold text-gray-800">
                      #{h.number}
                    </td>

                    <td className="px-5 py-3 text-gray-600">
                      {formatDateTime(h.drawnAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4">
          <button
            disabled={page <= 1 || isLoadingHistory}
            onClick={() => setPage(page - 1)}
            className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Prev
          </button>

          <span className="text-sm text-gray-600">
            Page {page}/{totalPages || 1}
          </span>

          <button
            disabled={
              page >= totalPages || isLoadingHistory || totalPages === 0
            }
            onClick={() => setPage(page + 1)}
            className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </section>
    </main>
  );
}
