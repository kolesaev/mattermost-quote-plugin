import {id as pluginId} from './manifest';

export default class Plugin {
    initialize(registry, store) {
        this.store = store;
        
        // Регистрируем кнопку рядом с Reply
        registry.registerPostActionComponent(this.createPostActionComponent());
    }

    // Компонент для кнопки с классами как у Message actions
    createPostActionComponent() {
        return (props) => {
            const {post} = props;
            
            const handleClick = (e) => {
                e.preventDefault();
                if (post?.id) {
                    this.quotePostById(post.id);
                }
            };

            return window.React.createElement(
                'button',
                {
                    className: 'style--none post-menu__item',
                    onClick: handleClick,
                    title: 'Quote'
                },
                window.React.createElement('i', { 
                    className: 'icon fa fa-quote-left',
                    style: { 
                        fontSize: '16px',
                        color: 'currentColor'
                    }
                })
            );
        };
    }

    async quotePostById(postId) {
        if (!this.store) return;

        try {
            const state = this.store.getState();
            const posts = state.entities?.posts?.posts;
            
            if (posts && posts[postId]) {
                const post = posts[postId];
                
                // Получаем username из состояния пользователей
                const users = state.entities?.users?.profiles;
                const user = users?.[post.user_id];
                const username = user?.username || 'user';
                
                // Удаляем ВЕСЬ предыдущий блок цитаты
                const cleanMessage = this.removePreviousQuoteBlock(post.message);
                
                // Форматируем сообщение с > перед каждой строкой
                const formattedMessage = this.formatMessageWithQuotes(cleanMessage);
                
                // Находим поле ввода (пробуем thread потом main)
                const textbox = this.getThreadTextbox() || this.getMainTextbox();
                
                if (textbox) {
                    textbox.value = `@${username}\n> ___\n${formattedMessage}\n\n___\n\n`;
                    textbox.focus();
                }
            } else {
                this.quoteViaDOM();
            }
        } catch (error) {
            this.quoteViaDOM();
        }
    }

    formatMessageWithQuotes(message) {
        if (!message) return '';
        
        const lines = message.split('\n');
        const quotedLines = lines.map(line => {
            if (line.trim() === '') {
                return '>';
            } else {
                return `> ${line}`;
            }
        });
        
        return quotedLines.join('\n');
    }

    removePreviousQuoteBlock(message) {
        if (!message) return message;
        
        const quoteBlockRegex = /@\w+\n> ___[\s\S]*?___\n\n/g;
        let cleanMessage = message.replace(quoteBlockRegex, '').trim();
        
        return cleanMessage;
    }

    getMainTextbox() {
        return document.getElementById('post_textbox') || 
               document.querySelector('[data-testid="post_textbox"]') ||
               document.querySelector('.post-create__textarea textarea') ||
               document.querySelector('.channel-textarea textarea');
    }

    getThreadTextbox() {
        return document.getElementById('reply_textbox') || 
               document.querySelector('[data-testid="reply_textbox"]') ||
               document.querySelector('.ThreadPane textarea') ||
               document.querySelector('.sidebar--right textarea') ||
               document.querySelector('.ThreadView textarea') ||
               document.querySelector('[aria-label*="Add a reply"]') ||
               document.querySelector('[placeholder*="Reply"]');
    }

    quoteViaDOM() {
        // Fallback логика
        const postElement = document.querySelector('.post:hover, .post.focused');
        
        if (postElement) {
            const messageElement = postElement.querySelector('.post-message__text, [data-testid*="message"]');
            const usernameElement = postElement.querySelector('.user-name, [data-testid*="username"]');
            
            const message = messageElement?.textContent || 'No message found';
            const username = usernameElement?.textContent || 'user';
            
            const cleanMessage = this.removePreviousQuoteBlock(message);
            const formattedMessage = this.formatMessageWithQuotes(cleanMessage);
            
            const textbox = this.getThreadTextbox() || this.getMainTextbox();
            
            if (textbox) {
                textbox.value = `@${username}\n> ___\n${formattedMessage}\n\n___\n\n`;
                textbox.focus();
            }
        }
    }
}

window.registerPlugin(pluginId, new Plugin());
