import { Link } from "wouter";
import { Button } from "../../components/ui/button";
import StudioLayout from "./StudioLayout";

export default function StudioIndex() {
  return (
    <StudioLayout>
      <div className="py-8">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-4">Studio — Project Registration</h1>
        <p className="text-muted-foreground mb-6">
          This is your project workspace. Register a new project, manage existing projects, and view analytics.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/studio/register">
            <Button size="lg" className="w-full">Register a new project</Button>
          </Link>
          <Link href="/projects">
            <Button variant="outline" size="lg" className="w-full">Manage my projects</Button>
          </Link>
        </div>

        <section className="mt-10">
          <h2 className="text-2xl font-bold mb-2">Getting started</h2>
          <ol className="list-decimal list-inside text-sm text-muted-foreground">
            <li>Connect your wallet (use the profile button on the top-right).</li>
            <li>Register your project — you'll be the owner and can invite collaborators later.</li>
            <li>Configure campaigns and quests in the project dashboard.</li>
          </ol>
        </section>
      </div>
    </StudioLayout>
  );
}
