export interface MissingEnvVar {
  name: string;
  description: string;
  example: string;
  required: boolean;
}

export function checkRequiredEnvVars(): MissingEnvVar[] {
  const requiredVars: MissingEnvVar[] = [
    {
      name: "AUTH_SECRET",
      description: "Secret key for NextAuth.js authentication",
      example: "your-secret-key-here",
      required: true,
    },
    {
      name: "POSTGRES_URL",
      description: "PostgreSQL database connection string",
      example: "", // No example - user needs to provide their own
      required: true,
    },
  ];

  const missing = requiredVars.filter((envVar) => {
    const value = process.env[envVar.name];
    return !value || value.trim() === "";
  });

  return missing;
}

export function hasAllRequiredEnvVars(): boolean {
  return checkRequiredEnvVars().length === 0;
}

export const hasEnvVars = !!(
  process.env.AUTH_SECRET && process.env.POSTGRES_URL
);
