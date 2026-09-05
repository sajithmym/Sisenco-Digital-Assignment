# Definition of done

A change is complete when it preserves the role matrix, report workflow, database constraints, validation/error contract, and documented setup/release behavior.

## Engineering checklist

- Keep business rules in backend services and validate every new input.
- Preserve TEAM_MEMBER, MANAGER, and ADMIN separation through API guards/service checks.
- Preserve draft privacy and server-enforced workflow transitions.
- Include a reviewed Prisma migration for data-model changes and update seed/tests as needed.
- Keep frontend payloads typed and errors safe/accessibly rendered.
- Centralize configuration and constants instead of duplicating values.

## Verification/release checklist

Run every command in [15 Testing](15-testing.md), update the relevant guides/README/SETUP/reference whenever behavior changes, use production secrets/HTTPS, run `prisma migrate deploy`, back up data, and complete manual browser QA. Do not mark planned/external work as complete until produced and verified.
