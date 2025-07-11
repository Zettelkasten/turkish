#! /usr/bin/env python3

# argparser with one argument for lang
import argparse
import errno
import signal

parser = argparse.ArgumentParser(description="Tokenize text from stdin.")
parser.add_argument("--lang", type=str, help="Language for tokenization, e.g. 'english' or 'turkish'", required=True)
args = parser.parse_args()

lang = {"en": "english", "tr": "turkish"}.get(args.lang, args.lang)

# setup tokenizer
import nltk
# nltk.download("punkt")
from nltk.tokenize import word_tokenize

# Restore default SIGPIPE behavior to avoid cascading exceptions
signal.signal(signal.SIGPIPE, signal.SIG_DFL)

# read stdin line by line
import sys
try:
    for line in sys.stdin:
        line = line.strip()
        if not line:
            continue
        tokens = word_tokenize(line, language=lang)
        print(" ".join(tokens))
except BrokenPipeError:
    # downstream closed: exit quietly
    sys.exit(0)
except IOError as e:
    if e.errno == errno.EPIPE:
        sys.exit(0)
    else:
        raise
