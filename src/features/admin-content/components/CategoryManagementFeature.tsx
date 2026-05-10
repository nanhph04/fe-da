"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const INITIAL_CATEGORIES = [
  { id: "1", name: "Cinematic Shorts", description: "High quality short films", videoCount: 142, status: "active" },
  { id: "2", name: "Documentaries", description: "In-depth true stories", videoCount: 89, status: "active" },
  { id: "3", name: "Music Videos", description: "Official music releases", videoCount: 304, status: "active" },
  { id: "4", name: "Independent", description: "Indie filmmaker showcase", videoCount: 56, status: "hidden" },
];

export function CategoryManagementFeature() {
  const [categories] = useState(INITIAL_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 border-b border-border/30 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-2 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary">Taxonomy</p>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-foreground">Category Management</h1>
          <p className="mt-2 font-body text-sm text-muted-foreground">Organize and curate content genres across the platform.</p>
        </div>
        <Button className="rounded-sm bg-primary px-6 py-2 font-headline font-bold text-primary-foreground transition-opacity hover:opacity-90">
          <span className="material-symbols-outlined mr-2">add</span>
          Create Category
        </Button>
      </header>

      <div className="flex items-center gap-4 rounded-lg border border-border/30 bg-card p-4">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">search</span>
          <Input
            className="w-full rounded-md border-border/30 bg-background py-6 pl-12 pr-5 text-foreground focus-visible:ring-primary"
            placeholder="Search categories by name or description..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
        <Button variant="outline" className="h-[50px] border-border/40 bg-transparent px-6 text-muted-foreground hover:bg-muted hover:text-foreground">
          <span className="material-symbols-outlined mr-2">filter_list</span>
          Filter
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredCategories.map((category) => (
          <article key={category.id} className="group relative overflow-hidden rounded-lg border border-border/30 bg-card p-6 transition-colors hover:border-border">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h2 className="font-headline text-xl font-bold text-foreground">{category.name}</h2>
              <div className="flex items-center gap-2">
                <span className={`rounded-sm bg-muted px-3 py-1 font-label text-xs font-bold uppercase tracking-widest ${category.status === "active" ? "text-secondary" : "text-muted-foreground"}`}>
                  {category.status}
                </span>
                <button className="text-muted-foreground transition-colors hover:text-foreground" aria-label={`More actions for ${category.name}`}>
                  <span className="material-symbols-outlined text-xl">more_vert</span>
                </button>
              </div>
            </div>

            <p className="mb-6 line-clamp-2 h-10 font-body text-sm text-muted-foreground">{category.description}</p>

            <div className="flex items-center justify-between border-t border-border/30 pt-4">
              <div className="flex items-center font-body text-sm text-muted-foreground">
                <span className="material-symbols-outlined mr-2 text-lg">movie</span>
                {category.videoCount} videos
              </div>
              <div className="flex gap-3 opacity-0 transition-opacity group-hover:opacity-100">
                <button className="text-muted-foreground transition-colors hover:text-secondary" title="Edit">
                  <span className="material-symbols-outlined">edit</span>
                </button>
                <button className="text-muted-foreground transition-colors hover:text-primary" title="Delete">
                  <span className="material-symbols-outlined">delete</span>
                </button>
              </div>
            </div>
          </article>
        ))}

        {filteredCategories.length === 0 ? (
          <div className="col-span-full rounded-lg border border-border/30 bg-card py-12 text-center">
            <span className="material-symbols-outlined mb-4 text-4xl text-muted-foreground">category</span>
            <h2 className="font-headline text-xl font-bold text-foreground">No categories found</h2>
            <p className="mt-2 font-body text-sm text-muted-foreground">Try adjusting your search terms.</p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
