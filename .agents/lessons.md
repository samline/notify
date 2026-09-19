# Lessons

- Keep numeric and string toast IDs distinct internally even though `data-id` serializes both to text.
- Timer pauses must store a deadline and subtract elapsed time before resuming.
- `ToasterController.update()` is partial: omitted offsets, gaps, styles, and subscriptions must remain unchanged.
- Tests for browser globals and package exports must execute built artifacts, not only TypeScript source modules.
- CDN examples must reference an actually published version or `latest`; a package version in Git does not imply npm availability.
- GitHub Pages deployment is externally confirmed for this repository. Do not relocate or replace its deployment workflow solely from local layout assumptions; verify the live deployment first.
