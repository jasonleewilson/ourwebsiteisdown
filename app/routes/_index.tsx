import type { MetaFunction } from "@remix-run/cloudflare";
import { json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

declare global {
  interface Env {
    API_KEY: string;
  }
}

interface WhoisData {
  domain?: string;
  isUp?: string;
  whoisData?: Record<string, any> | null;
  error?: string;
}

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const domain = formData.get("domain") as string;

  if (!domain) {
    return json({ error: "Please enter a domain name." });
  }

  try {
    const response = await fetch(`https://${domain}`);
    const isUp = response.ok ? "Website is running" : "Website is down";

    const whoisResponse = await fetch(
      `https://api.api-ninjas.com/v1/whois?domain=${domain}`,
      {
        headers: { "X-Api-Key": process.env.API_KEY as string },
      }
    );
    const whoisData = await whoisResponse.json();

    return json<WhoisData>({ domain, isUp, whoisData });
  } catch (error) {
    return json<WhoisData>({
      domain,
      isUp: "Website is down",
      whoisData: null,
    });
  }
};

export default function Index() {
  const data = useActionData<WhoisData>();

  return (
    <div>
      <h1>Domain Status Checker</h1>
      <Form method='post'>
        <input
          type='text'
          name='domain'
          placeholder='Enter domain (e.g. example.com)'
          required
        />
        <button type='submit'>Check</button>
      </Form>
      {data && (
        <div>
          <h2>Results for {data.domain}</h2>
          <p>{data.isUp}</p>
          {data.whoisData && (
            <pre>{JSON.stringify(data.whoisData, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
}
