# Behind the Firewall — Field Lab

A static, browser-only reinforcement activity, two presentation demos, and a sample vulnerability assessment report based on the webinar. The student activity, simulated terminal, SIEM view, and report are separate pages and can be hosted together on GitHub Pages.

## Publish on GitHub Pages

1. Put the HTML, CSS, and JavaScript files in the repository's publishing source (the repository root works for a branch-based Pages site).
2. In the repository, open **Settings → Pages**, choose the branch and `/ (root)` as the source, then save.
3. Keep `verify_completion.py` locally for checking submitted receipts. It is not needed by the hosted site.

The pages use system fonts and make no external requests. Use the header links to move among `index.html` (student activity), `demo-terminal.html`, `demo-siem.html`, and `report.html` (sample report).
The student activity includes a drag-to-rank prioritization exercise and a defender-log quiz with the relevant sample logs shown on the page. Students can move between questions without answering, return to skipped questions, and reveal an answer after one incorrect try.

## Run the presentation demo

Open the terminal and SIEM pages in two tabs using the same browser and site origin. In the terminal, enter `nmap 192.168.1.5` to list the lab's four open ports, `hydra-sim --target 192.168.1.5 --port 22 --account labuser` to generate scripted SSH failure and success logs, then `ssh labuser@192.168.1.5` and enter the displayed lab-only password (`weakpass123`). `restart` clears the feed and resets the flow; `help` lists the commands. Expand **Details** on a SIEM row to inspect its fields.

These are predefined commands in a mock terminal, not a shell. `hydra-sim` is a custom simulation command; it is not the Hydra program. The page does not run Nmap, Hydra, or SSH, contact `192.168.1.5` or any other host, or submit credentials. Events—including port probes and OpenSSH-style authentication/session logs—are generated locally and shared through this browser's local storage and `BroadcastChannel`; they are not sent to a server. The SIEM chart plots active alert categories over event time.

## Check completion receipts locally

Run Python 3 with one or more student codes (replace the quoted example with the code received):

```sh
python3 verify_completion.py 'CODE_FROM_STUDENT'
```

Or save codes one per line in a text file and check them together:

```sh
python3 verify_completion.py --file student-codes.txt
```

The verifier checks the receipt format, the current or previous answer fingerprint, the checksum, and duplicate receipt IDs in the same batch. A valid result is a convenient offline completion receipt, **not secure proof of completion**: the activity and verification algorithm are public, so a student could fabricate a code or share one. GitHub Pages cannot keep a signing secret. If tamper-resistant completion or one-code-per-student enforcement is required, use a backend or pre-issued codes instead.
