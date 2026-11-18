#!/usr/bin/env python3
"""Check completion receipt format, answer fingerprint, and checksum offline."""

import argparse
import hashlib
import re
import sys
from pathlib import Path

ANSWER_FINGERPRINT_INPUTS = (
    "va|patch+reachability|finding-b+finding-c+finding-a|"
    "attacker-ip+failed-count-5+ssh-destination-port-22|report-elements|same-method-same-scope",
    "va|patch+reachability|finding-b+finding-c+finding-a|"
    "port-scan+ssh-failures+ssh-login|report-elements|same-method-same-scope",
    "va|patch+reachability|finding-a+finding-b+finding-c|"
    "child-process|report-elements|same-method-same-scope",
)
ANSWER_FINGERPRINTS = {
    hashlib.sha256(value.encode("ascii")).hexdigest()[:8].upper()
    for value in ANSWER_FINGERPRINT_INPUTS
}
CODE_PATTERN = re.compile(r"^BWF1-([0-9A-F]{20})-([0-9A-F]{8})-([0-9A-F]{8})$")


def verify(code: str) -> tuple[bool, str, str | None]:
    code = code.strip().upper()
    match = CODE_PATTERN.fullmatch(code)
    if not match:
        return False, "invalid format", None

    nonce, fingerprint, supplied_checksum = match.groups()
    if fingerprint not in ANSWER_FINGERPRINTS:
        return False, "answer fingerprint does not match this activity", nonce

    core = f"BWF1-{nonce}-{fingerprint}"
    expected_checksum = hashlib.sha256(core.encode("ascii")).hexdigest()[:8].upper()
    if supplied_checksum != expected_checksum:
        return False, "checksum mismatch", nonce

    return True, "valid format and activity fingerprint", nonce


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Check one or more Behind the Firewall completion receipts."
    )
    parser.add_argument("codes", nargs="*", help="receipt codes to check")
    parser.add_argument(
        "--file",
        type=Path,
        help="read one receipt code per line from a text file",
    )
    args = parser.parse_args()

    codes = list(args.codes)
    if args.file:
        try:
            codes.extend(args.file.read_text(encoding="utf-8").splitlines())
        except OSError as error:
            print(f"Could not read {args.file}: {error}", file=sys.stderr)
            return 2
    if not codes:
        parser.error("provide at least one receipt code or --file")

    seen: set[str] = set()
    all_valid = True
    for code in codes:
        valid, reason, nonce = verify(code)
        if valid and nonce in seen:
            valid, reason = False, "duplicate receipt ID in this batch"
        elif valid and nonce is not None:
            seen.add(nonce)

        label = code.strip() or "<blank line>"
        print(f"{'VALID' if valid else 'INVALID'}  {label}  {reason}")
        all_valid = all_valid and valid

    return 0 if all_valid else 1


if __name__ == "__main__":
    raise SystemExit(main())
