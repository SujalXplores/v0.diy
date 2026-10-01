export interface RequiredEnvVar {
  name: string;
  description: string;
  example: string;
}

const REQUIRED_ENV_VARS: RequiredEnvVar[] = [
  {
    name: "AUTH_SECRET",
    description: "Secret key for NextAuth.js authentication",
    example: "your-secret-key-here",
  },
  {
    name: "POSTGRES_URL",
    description: "PostgreSQL database connection string",
    example: "",
  },
];

export function getMissingEnvVars(): RequiredEnvVar[] {
  return REQUIRED_ENV_VARS.filter(
    (envVar) => !process.env[envVar.name]?.trim(),
  );
}

export function toEnvFileContent(envVars: RequiredEnvVar[]): string {
  return envVars.map((envVar) => `${envVar.name}=${envVar.example}`).join("\n");
}
