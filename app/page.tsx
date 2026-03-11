'use client';

import { useEffect, useState } from 'react';

export default function Home() {
  const year = new Date().getFullYear();

  const [history, setHistory] = useState([]);
  const [page, setPage] = useState(1);

  const pageSize = 10;

  const [total, setTotal] = useState(0);

  async function load() {
    const res = await fetch(
      `/api/history?year=${year}&page=${page}&pageSize=${pageSize}`,
    );

    const json = await res.json();

    setHistory(json.data);

    setTotal(json.total);
  }

  async function draw() {
    const drawDate = new Date().toISOString().slice(0, 10);

    await fetch('/api/draw', {
      method: 'POST',
      body: JSON.stringify({
        year,
        drawDate,
      }),
    });

    load();
  }

  useEffect(() => {
    load();
  }, [page]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <main className='max-w-3xl mx-auto bg-white shadow p-6 rounded'>
      <h1 className='text-2xl font-bold mb-4'>Random Day Generator</h1>

      <button
        onClick={draw}
        className='bg-blue-500 text-white px-4 py-2 rounded mb-6'
      >
        Quay số
      </button>

      <table className='w-full border'>
        <thead className='bg-gray-200'>
          <tr>
            <th className='p-2 border'>Number</th>
            <th className='p-2 border'>Date</th>
            <th className='p-2 border'>DrawnAt</th>
          </tr>
        </thead>

        <tbody>
          {history.map((h: any) => (
            <tr key={h.id}>
              <td className='border p-2 text-center'>{h.number}</td>

              <td className='border p-2'>{h.drawDate}</td>

              <td className='border p-2'>{h.drawnAt}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className='flex gap-2 mt-4'>
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className='px-3 py-1 bg-gray-200 rounded'
        >
          Prev
        </button>

        <span>
          Page {page}/{totalPages || 1}
        </span>

        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          className='px-3 py-1 bg-gray-200 rounded'
        >
          Next
        </button>
      </div>
    </main>
  );
}
