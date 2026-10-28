"""Guards for settings that are easy to break by accident (automated dependency bumps, unpinning)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def test_model_dependencies_stay_pinned():
    requirements = (ROOT / "backend" / "requirements.txt").read_text(encoding="utf-8")
    for pin in ("scikit-learn==1.6.1", "pandas==", "numpy=="):
        assert pin in requirements, f"{pin} must stay pinned (the model and the host depend on it)"


def test_dependabot_leaves_the_pinned_backend_packages_alone():
    config = (ROOT / ".github" / "dependabot.yml").read_text(encoding="utf-8")
    for name in ("scikit-learn", "pandas", "numpy"):
        assert f"dependency-name: {name}" in config, f"dependabot.yml must ignore {name}"


def test_render_blueprint_documents_the_proxy_setting():
    blueprint = (ROOT / "render.yaml").read_text(encoding="utf-8")
    assert "TRUSTED_PROXY_COUNT" in blueprint
