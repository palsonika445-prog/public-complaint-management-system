import click
from flask.cli import with_appcontext
from app.services.sla_service import check_and_escalate_overdue_complaints

@click.command("check-overdue")
@click.option("--city-id", default=None, type=int, help="Optional City ID to check specifically")
@with_appcontext
def check_overdue_command(city_id):
    """Scan and escalate overdue complaints past their SLA target deadline."""
    count = check_and_escalate_overdue_complaints(city_id)
    click.echo(f"SLA Check Complete: {count} complaints marked overdue and escalated.")


def register_cli_commands(app):
    app.cli.add_command(check_overdue_command)
