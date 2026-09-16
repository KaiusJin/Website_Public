"""Run the full migration chain against a disposable PostgreSQL, never production."""
import pathlib
import shutil
import subprocess
import tempfile

root = pathlib.Path(__file__).resolve().parents[1]
commands = {name: shutil.which(name) for name in ('initdb', 'pg_ctl', 'psql')}
if not all(commands.values()):
    raise SystemExit('Install PostgreSQL and put initdb, pg_ctl and psql on PATH.')


def run(args):
    return subprocess.run(args, text=True, capture_output=True, timeout=60)


with tempfile.TemporaryDirectory(prefix='website-test-pg-') as temporary:
    work = pathlib.Path(temporary)
    data, socket = work / 'data', work / 'socket'
    socket.mkdir()
    started = False
    try:
        result = run([commands['initdb'], '-D', str(data), '-A', 'trust', '-U', 'fixture'])
        if result.returncode:
            raise RuntimeError(result.stderr)
        result = run([commands['pg_ctl'], '-D', str(data), '-l', str(work / 'postgres.log'),
                      '-o', f"-k {socket} -p 55439 -c listen_addresses=''", '-w', 'start'])
        if result.returncode:
            raise RuntimeError(result.stderr)
        started = True
        files = [root / 'tests/cms-fixture.sql', *sorted((root / 'supabase/migrations').glob('*.sql')),
                 root / 'tests/cms-database.sql']
        for file in files:
            result = run([commands['psql'], '-X', '-h', str(socket), '-p', '55439', '-U', 'fixture',
                          '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-f', str(file)])
            if result.returncode:
                raise RuntimeError(f'{file.name}: {result.stderr}')
            print(f'PASS {file.name}', flush=True)
    finally:
        if started:
            run([commands['pg_ctl'], '-D', str(data), '-m', 'fast', '-w', 'stop'])
