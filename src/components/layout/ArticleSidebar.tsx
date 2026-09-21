import { articles } from "../../services/articlesData"
import { Link } from 'react-router-dom'

interface Props {
    currentSlug: string
}

const ArticleSidebar: React.FC<Props> = ({ currentSlug }) => {
    return (
        <aside className="w-64 shrink-0 sticky top-28 h-fit">
            <div className="rounded-2xl border border-purple-500/20 bg-purple-950/20 backdrop-blur-md p-4 shadow-xl">

                <h2 className="text-purple-100 font-bold mb-4 text-lg">
                    Articles
                </h2>

                <nav className="space-y-2">
                    {articles.map((a) => {
                        const slug = a.href

                        const isActive = slug === currentSlug

                        return (
                            <Link
                                key={a.href}
                                to={`/articles/${slug}`}
                                className={`
                                    block px-3 py-2 rounded-xl text-sm transition
                                    ${isActive
                                        ? 'bg-purple-600 text-white'
                                        : 'text-purple-200 hover:bg-purple-900/40'
                                    }
                                `}
                            >
                                {a.title}
                            </Link>
                        )
                    })}
                </nav>
            </div>
        </aside>
    )
}

export default ArticleSidebar