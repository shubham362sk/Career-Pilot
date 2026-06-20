const JSEARCH_KEY = import.meta.env.VITE_RAPIDAPI_KEY || "6c38e4f3a5msh5986de3c61e9161p1ef149jsn7b5ea9d2f2ad";

export interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo: string | null;
  job_city: string;
  job_state: string;
  job_country: string;
  job_employment_type: string;
  job_apply_link: string;
  job_description: string;
  job_min_salary: number | null;
  job_max_salary: number | null;
  job_salary_currency: string | null;
  job_required_skills: string[] | null;
  job_posted_at_datetime_utc: string;
}

export async function searchJobs(
  query: string,
  location: string = "India",
  page: number = 1
): Promise<{ data: JSearchJob[]; error?: string }> {
  const fullQuery = `${query} ${location}`.trim();

  // Log API Key presence (only first 4 chars for security)
  console.log(`JSearch: Starting search with key prefix: ${JSEARCH_KEY?.substring(0, 4)}...`);

  try {
    const res = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(fullQuery)}&page=${page}&num_pages=1&date_posted=all`,
      {
        headers: {
          "x-rapidapi-key": JSEARCH_KEY,
          "x-rapidapi-host": "jsearch.p.rapidapi.com",
        },
      }
    );

    if (!res.ok) {
      if (res.status === 403) {
        throw new Error("403 Forbidden: Ensure your RapidAPI key is valid and has an active JSearch subscription. If it is, this might be a CORS block.");
      }
      throw new Error(`API error: ${res.status}`);
    }

    const json = await res.json();
    return { data: json.data || [] };
  } catch (e: any) {
    console.error("JSearch error:", e);
    return { data: [], error: e.message };
  }
}
