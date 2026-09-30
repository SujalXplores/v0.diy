export interface RequiredEnvVar {
  name: string;
  description: string;
  /** Placeholder written into the generated `.env` snippet. */
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
    // No example: users need to provide their own connection string.
    example: "",
  },
];

/** Returns the required environment variables that are unset or blank. */
export function getMissingEnvVars(): RequiredEnvVar[] {
  return REQUIRED_ENV_VARS.filter(
    (envVar) => !process.env[envVar.name]?.trim(),
  );
}

/** Builds the `.env` lines a developer needs to add. */
export function toEnvFileContent(envVars: RequiredEnvVar[]): string {
  return envVars.map((envVar) => `${envVar.name}=${envVar.example}`).join("\n");
}
