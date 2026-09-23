import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { getArticleBySlug } from '@/services/articlesData'
import ArticleSidebar from '@/components/layout/ArticleSidebar'
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { visit } from "unist-util-visit";
import { useTranslation } from 'react-i18next'



const getLangCode = (lang: string) => {
    if (lang.includes('עברית') || lang.toLowerCase().includes('hebrew') || lang.toLowerCase().includes('he')) return 'he'
    if (lang.toLowerCase().includes('english') || lang.toLowerCase().includes('en')) return 'en'
    return 'en' // fallback
}

function remarkGithubAlerts() {
    return (tree: any) => {
        visit(tree, "blockquote", (node) => {
            const firstChild = node.children?.[0];

            if (firstChild?.type === "paragraph") {
                const text = firstChild.children?.[0]?.value;

                if (!text) return;

                const match = text.match(/^\[\!(TIP|IMPORTANT|WARNING|NOTE)\]\s*/);

                if (match) {
                    const type = match[1].toLowerCase();

                    firstChild.children[0].value = text.replace(match[0], "");

                    node.data = {
                        hProperties: {
                            className: `callout callout-${type}`,
                        },
                    };
                }
            }
        });
    };
}

type ArticleType = 'md' | null

/** Article metadata is read from the index, so the page renders the body only. */
const stripFrontmatter = (raw: string) => raw.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')

const ArticlePage: React.FC = () => {
    const { slug } = useParams()

    const type: ArticleType = 'md'
    const [markdown, setMarkdown] = useState('')
    const [loading, setLoading] = useState(true)

    const article = slug ? getArticleBySlug(slug) : undefined
    const imageBase = slug ? `/articles/${slug}/` : '' // Folder that contains the current article's images

    const { i18n } = useTranslation()
    const [ready, setReady] = useState(false)

    useEffect(() => {
        if (!slug) return

        let cancelled = false

        const run = async () => {
            setLoading(true)
            setReady(false)

            try {
                const articleData = getArticleBySlug(slug)
                if (!articleData) return

                const lang = getLangCode(articleData.language)

                // IMPORTANT: wait until i18n is truly ready
                if (i18n.language !== lang) {
                    await i18n.changeLanguage(lang)

                    document.documentElement.setAttribute(
                        'dir',
                        lang === 'he' ? 'rtl' : 'ltr'
                    )

                    document.documentElement.setAttribute(
                        'lang',
                        lang
                    )
                    await new Promise(requestAnimationFrame) // <- key fix
                }

                const mdPath = `/articles/${slug}/${slug}.md`
                const res = await fetch(mdPath)
                if (!res.ok) throw new Error('MD not found')

                const text = await res.text()

                if (cancelled) return

                setMarkdown(stripFrontmatter(text))
                setReady(true)

            } catch (err) {
                console.error(err)
                setMarkdown('')
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        run()

        return () => {
            cancelled = true
        }
    }, [slug])
    return (
        <div className="min-h-screen pt-24 pb-20 bg-gradient-to-b from-[#090510] via-[#12081e] to-[#090510]">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row gap-8 items-start">

                {/* SIDEBAR */}
                <div className="w-72 shrink-0">
                    <ArticleSidebar currentSlug={slug || ''} />
                </div>

                {/* MAIN ARTICLE */}
                <div className="flex-1 min-w-0 w-full max-w-none md:max-w-4xl mx-auto">
                    {loading && (
                        <div className="text-center text-purple-200 text-lg">
                            Loading article...
                        </div>
                    )}

                    {!loading && type === 'md' && article && ready && (
                        <div className="w-full rounded-3xl border border-purple-500/20 bg-purple-950/20 backdrop-blur-md shadow-2xl shadow-purple-900/30 p-6 md:p-10">

                            <h1 className="text-3xl md:text-4xl font-bold text-purple-100 mb-6">
                                {article.title}
                            </h1>

                            <div className="text-purple-300 text-sm mb-8 flex gap-4 flex-wrap">
                                <span>{article.date}</span>
                                <span>•</span>
                                <span>{article.readTime} min read</span>
                            </div>

                            <article className="prose prose-invert max-w-none w-full
                                
                                prose-headings:text-purple-100
                                prose-p:text-purple-50/90
                                prose-a:text-violet-300 hover:prose-a:text-violet-200
                                prose-code:text-violet-200
                                prose-pre:bg-purple-950
                                prose-blockquote:border-purple-500
                                prose-strong:text-purple-100
                                prose-li:text-purple-50/90
                            ">
                                <ReactMarkdown remarkPlugins={[remarkGfm, remarkGithubAlerts]}
                                    rehypePlugins={[rehypeRaw]}
                                    components={{
                                        img: ({ src = '', alt = '', ...props }) => (
                                            <img
                                                src={
                                                    src.startsWith('http') || src.startsWith('/')
                                                        ? src
                                                        : imageBase + src
                                                }
                                                alt={alt}
                                                className="rounded-xl my-6 mx-auto"
                                                {...props}
                                            />
                                        ),

                                        a: ({ href = '', children }) => {
                                            // internal link → use React Router
                                            if (href.startsWith('/')) {
                                                return <Link to={href}>{children}</Link>
                                            }

                                            // external link → normal anchor
                                            return (
                                                <a href={href} target="_blank" rel="noopener noreferrer">
                                                    {children}
                                                </a>
                                            )
                                        },
                                    }}
                                >
                                    {markdown}
                                </ReactMarkdown>
                            </article>
                        </div>
                    )}

                    {!loading && !article && (
                        <div className="text-center text-red-300 text-xl">
                            Article not found
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

export default ArticlePage